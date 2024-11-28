# Passo a Passo para Configurar o Aplicativo de Descriptografia de Mídia no EasyPanel

Este guia fornece as etapas necessárias para configurar e executar o aplicativo de descriptografia de áudio do WhatsApp em um servidor utilizando EasyPanel.

## 1. Pré-Requisitos
- Um servidor configurado com EasyPanel.
- Docker instalado e funcionando corretamente.
- Node.js (versão 16) e npm instalados.
- Acesso ao terminal do servidor.

## 2. Upload dos Arquivos para o Servidor

Os arquivos que você precisa para configurar o aplicativo são:
- `decryptMedia.js` – O script Node.js para descriptografar os arquivos de áudio.
- `package.json` – Contém as dependências do projeto.
- `Dockerfile` – Define como construir a imagem Docker para a aplicação.

Envie esses arquivos para o servidor, usando o SCP (ou outra ferramenta de upload) para o diretório de trabalho desejado.

Exemplo de comando SCP:
```bash
scp /caminho/para/arquivo usuario@seu-servidor:/caminho/destino
```

## 3. Construir a Imagem Docker

No servidor, navegue até o diretório onde os arquivos estão localizados e execute os seguintes comandos para construir a imagem Docker:

```bash
cd /caminho/para/seu/projeto
```

Agora, execute o comando Docker para construir a imagem:
```bash
docker build -t descriptografar-audio .
```
Este comando utilizará o `Dockerfile` para criar uma imagem chamada `descriptografar-audio`.

## 4. Executar o Container Docker

Depois de construir a imagem, você precisa executar o container Docker:

```bash
docker run -d -p 4001:4001 --name decrypt_audio descriptografar-audio
```

Este comando irá:
- Executar o container em modo "detached" (`-d`), ou seja, em segundo plano.
- Mapear a porta 4001 do container para a porta 4001 do host (`-p 4001:4001`).
- Nomear o container como `decrypt_audio` (`--name decrypt_audio`).

## 5. Configuração no EasyPanel

1. Acesse o EasyPanel e crie uma nova aplicação.
2. Escolha o tipo "Docker" e insira o nome da aplicação.
3. Configure as portas para que a aplicação use a porta 4001.
4. Na opção de "Imagem Docker", selecione a imagem `descriptografar-audio` que você criou.

## 6. Verificação do Funcionamento

Para verificar se a aplicação está funcionando corretamente, você pode enviar uma solicitação HTTP para o endpoint `/decrypt` com as informações necessárias (mediaUrl e mediaKey).

Exemplo de solicitação usando `curl`:
```bash
curl -X POST http://seu-servidor:4001/decrypt -H "Content-Type: application/json" -d '{"mediaUrl": "<URL do arquivo>", "mediaKey": "<Chave Base64>"}'
```

Se tudo estiver configurado corretamente, você receberá como resposta o arquivo de áudio descriptografado.

## 7. Automatização com PM2 (Opcional)
Para garantir que o serviço esteja sempre ativo, você pode usar o PM2:

1. Instale o PM2:
   ```bash
   npm install -g pm2
   ```

2. Inicie o serviço com PM2:
   ```bash
   pm2 start decryptMedia.js --name decryptAudio
   ```

3. Garanta que o serviço inicie automaticamente:
   ```bash
   pm2 startup
   pm2 save
   ```

## 8. Considerações Finais
- Certifique-se de que o servidor tenha permissões adequadas para salvar os arquivos na pasta `/tmp`.
- Mantenha o ambiente seguro, restringindo as portas de rede e as permissões de arquivo conforme necessário.

