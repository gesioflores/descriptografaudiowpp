const express = require('express');
const axios = require('axios');
const { decryptMedia } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

app.post('/decrypt', async (req, res) => {
  try {
    const { mediaUrl, mediaKey } = req.body;

    // Baixar o arquivo criptografado do WhatsApp
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const encryptedMedia = Buffer.from(response.data, 'binary');

    // Descriptografar a mídia
    const decryptedMedia = await decryptMedia({
      ciphertext: encryptedMedia,
      mediaKey: Buffer.from(mediaKey, 'base64'),
      type: 'audio',
    });

    // Enviar o áudio descriptografado
    res.setHeader('Content-Type', 'audio/ogg');
    res.send(decryptedMedia);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(4001, () => {
  console.log('Servidor rodando na porta 4001');
});
