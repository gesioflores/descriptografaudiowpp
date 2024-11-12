const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(express.json());

// Função HKDF para derivar as chaves de criptografia
function hkdf(key, length, appInfo = Buffer.alloc(0)) {
  const salt = Buffer.alloc(32); // Salt de 32 bytes zerados
  const prk = crypto.createHmac('sha256', salt).update(key).digest();

  let keyBlock = Buffer.alloc(0);
  let keyStream = Buffer.alloc(0);
  let blockIndex = 1;

  while (keyStream.length < length) {
    const hmac = crypto.createHmac('sha256', prk);
    hmac.update(keyBlock);
    hmac.update(appInfo);
    hmac.update(Buffer.from([blockIndex]));
    keyBlock = hmac.digest();
    keyStream = Buffer.concat([keyStream, keyBlock]);
    blockIndex += 1;
  }

  return keyStream.slice(0, length);
}

app.post('/decrypt', async (req, res) => {
  try {
    const { mediaUrl, mediaKey } = req.body;

    // Verificar comprimento da mediaKey
    if (!mediaKey || Buffer.from(mediaKey, 'base64').length !== 32) {
      throw new Error('A mediaKey fornecida não é válida ou não tem o comprimento correto.');
    }

    // Decodificar mediaKey de Base64
    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');

    // Baixar o arquivo criptografado do WhatsApp e salvá-lo em disco
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const encryptedMedia = Buffer.from(response.data, 'binary');
    const encryptedFilePath = './encrypted_media.enc';
    fs.writeFileSync(encryptedFilePath, encryptedMedia);

    // Expandir a mediaKey usando HKDF
    const expandedKey = hkdf(mediaKeyBuffer, 112, Buffer.from("WhatsApp Audio Keys"));
    const cipherKey = expandedKey.slice(16, 48);
    const iv = expandedKey.slice(0, 16);

    // Ler o arquivo criptografado salvo em disco
    const fileData = fs.readFileSync(encryptedFilePath);

    // Criar Decipher usando a chave e IV derivados
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    decipher.setAutoPadding(false);

    // Tentar descriptografar a mídia, mas sem usar decipher.final()
    let decryptedMediaPart = decipher.update(fileData);

    // Salvar o resultado parcial em disco para análise
    const decryptedPartialPath = './decrypted_partial_output.bin';
    fs.writeFileSync(decryptedPartialPath, decryptedMediaPart);

    console.log('Arquivo descriptografado parcialmente salvo em:', decryptedPartialPath);

    // Enviar o áudio descriptografado parcialmente
    res.setHeader('Content-Type', 'audio/ogg');
    res.send(decryptedMediaPart);
  } catch (error) {
    console.error("Erro ao descriptografar a mídia:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(4001, () => {
  console.log('Servidor rodando na porta 4001');
});
