// Deno
import express from "https://esm.sh/express";
import bPromise from 'https://esm.sh/brotli-wasm'

const brotli = await bPromise
const textDecoder = new TextDecoder()

const app = express();

const a = 1139324508;

function base64ToUint8ArrayBuffer(b) {
    const s = atob(b);
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
}

async function render(value) {
    const uint = base64ToUint8ArrayBuffer(value)
    const decompressed = await brotli.decompress(uint)
    return textDecoder.decode(decompressed)
}

app.get("/", async (req, res) => {
    const {value} = await fetch(
        `https://mainnet-api.algonode.cloud/v2/applications/${a}/box?name=int:1`,
    ).then(r => r.json())

    res.send(await render(value))
});

app.get("/:id", (req, res) => {
    const url = `https://mainnet-api.algonode.cloud/v2/applications/${req.params.id}/box?${new URLSearchParams(req.query)}`
    fetch(url).then(async r => {
        res.status(r.status)
        const data = await r.json()
        if (r.status !== 200) {
            res.send(data)
        } else {
            res.send(await render(data.value))
        }

    })
})

app.listen(3000);
