/**
 * Gera MP3 de narração via proxy TecnoCursos → pasta audios/
 * Pula arquivos existentes (use --force para regenerar).
 *
 * Uso:
 *   node generate-audios-proxy.js              # todos (curso 32 págs)
 *   node generate-audios-proxy.js s1 sq1       # só esses slides
 *   node generate-audios-proxy.js --force s1
 *   node generate-audios-proxy.js --dry-run
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const AUDIO_DATA = require('./audio-data.js');

const ROOT = __dirname;
const API_BASE = 'https://texttospeech.escolatecnocursos.cloud';
const AUDIOS_DIR = path.join(ROOT, 'audios');

function loadEnvFile() {
    for (const filename of ['.env', '.env.local']) {
        const envPath = path.join(ROOT, filename);
        if (!fs.existsSync(envPath)) continue;
        for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eq = trimmed.indexOf('=');
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = value;
        }
    }
}

function parseArgs(argv) {
    return {
        force: argv.includes('--force'),
        dry: argv.includes('--dry-run'),
        ids: argv.filter(function (a) { return !a.startsWith('--'); })
    };
}

function loadSlide(file, slideId) {
    const htmlPath = path.join(ROOT, file);
    if (!fs.existsSync(htmlPath)) return null;
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    return dom.window.document.getElementById(slideId);
}

async function login() {
    const username = process.env.AUTH_USERNAME;
    const password = process.env.AUTH_PASSWORD;
    if (!username || !password) {
        throw new Error('Defina AUTH_USERNAME e AUTH_PASSWORD em .env');
    }
    const res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    });
    if (!res.ok) throw new Error('Login falhou (' + res.status + '): ' + (await res.text()));
    const data = await res.json();
    if (!data.token) throw new Error('Token ausente na resposta de login');
    return data.token;
}

async function synthesize(text, token) {
    const res = await fetch(API_BASE + '/api/tts', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    });
    if (!res.ok) throw new Error('TTS falhou (' + res.status + '): ' + (await res.text()));
    return Buffer.from(await res.arrayBuffer());
}

function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
}

function writeManifest(entries) {
    if (!fs.existsSync(AUDIOS_DIR)) fs.mkdirSync(AUDIOS_DIR, { recursive: true });
    const slides = entries.map(function (e) {
        const abs = path.join(ROOT, e.file);
        const ready = fs.existsSync(abs) && fs.statSync(abs).size > 500;
        return {
            id: e.id,
            slideId: e.slideId || e.id,
            file: e.file,
            text: e.text,
            audioReady: ready,
            globalN: e.globalN,
            state: e.state || 'main'
        };
    });
    const payload = {
        generatedAt: new Date().toISOString(),
        totalPages: AUDIO_DATA.TOTAL_PAGES,
        slides: slides
    };
    fs.writeFileSync(path.join(AUDIOS_DIR, 'manifest.json'), JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(
        path.join(AUDIOS_DIR, 'audio-manifest.js'),
        'window.__AUDIO_NARRATION__ = ' + JSON.stringify(payload) + ';\n',
        'utf8'
    );
    console.log('Manifesto: audios/manifest.json + audios/audio-manifest.js (' + slides.length + ' entradas)');
}

async function main() {
    loadEnvFile();
    const args = parseArgs(process.argv.slice(2));
    const onlyIds = args.ids.length ? args.ids : null;

    const allEntries = AUDIO_DATA.buildManifestEntries(loadSlide);
    const onlySet = onlyIds ? new Set(onlyIds) : null;
    const entries = onlySet
        ? allEntries.filter(function (e) { return onlySet.has(e.slideId); })
        : allEntries;

    if (!entries.length) {
        console.error('Nenhuma entrada.');
        process.exit(1);
    }

    console.log('Entradas a gerar:', entries.length, '(manifesto total:', allEntries.length + ')');
    if (args.dry) {
        entries.forEach(function (e) {
            console.log('  ' + e.file.padEnd(36) + ' (' + e.text.length + ') ' + e.text.slice(0, 70) + (e.text.length > 70 ? '…' : ''));
        });
        writeManifest(allEntries);
        return;
    }

    const token = await login();
    let ok = 0, skip = 0, fail = 0;

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const abs = path.join(ROOT, e.file);
        const prefix = '[' + (i + 1) + '/' + entries.length + ']';

        if (!args.force && fs.existsSync(abs) && fs.statSync(abs).size > 500) {
            console.log(prefix + ' ⏭ ' + e.file);
            skip++;
            continue;
        }
        if (!e.text || e.text.length < 3) {
            console.warn(prefix + ' skip vazio: ' + e.file);
            skip++;
            continue;
        }

        process.stdout.write(prefix + ' ▶ ' + e.file + ' (' + e.text.length + ')... ');
        try {
            const buf = await synthesize(e.text, token);
            fs.mkdirSync(path.dirname(abs), { recursive: true });
            fs.writeFileSync(abs, buf);
            console.log('ok (' + Math.round(buf.length / 1024) + ' KB)');
            ok++;
        } catch (err) {
            console.log('FALHOU');
            console.error('  ' + err.message);
            fail++;
        }
        if (i < entries.length - 1) await sleep(400);
    }

    writeManifest(allEntries);
    console.log('\nResumo: ' + ok + ' gerados, ' + skip + ' pulados, ' + fail + ' falhas.');
    if (fail > 0) process.exitCode = 1;
}

main().catch(function (err) {
    console.error('ERRO FATAL:', err);
    process.exit(1);
});
