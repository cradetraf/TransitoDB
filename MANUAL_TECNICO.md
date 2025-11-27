# Manual Técnico - App Trânsito Seguro

Este documento descreve como configurar o backend (Google Apps Script) e instalar o aplicativo nos smartphones.

## 1. Configuração do Backend (Google Sheets & Drive)

Esta etapa deve ser realizada em um computador, utilizando a conta Google que centralizará os dados.

### Passo 1.1: Criar a Planilha
1. Acesse [Google Sheets](https://sheets.google.com).
2. Crie uma nova planilha chamada `TransitoDB`.
3. Na primeira linha (Cabeçalho), adicione as seguintes colunas na ordem exata:
   - `A1`: ID
   - `B1`: DataHora Registro (Auto)
   - `C1`: Data Usuário
   - `D1`: Hora Usuário
   - `E1`: Região
   - `F1`: Bairro
   - `G1`: Rua
   - `H1`: Referência/Número
   - `I1`: Notas
   - `J1`: Latitude
   - `K1`: Longitude
   - `L1`: Link Foto

### Passo 1.2: Criar a Pasta no Drive
1. Acesse [Google Drive](https://drive.google.com).
2. Crie uma pasta chamada `Fotos_Transito`.
3. Abra a pasta e copie o ID da pasta que aparece na URL do navegador.
   - Exemplo: na url `drive.google.com/drive/u/0/folders/1abcDEfg...`, o ID é `1abcDEfg...`.

### Passo 1.3: Configurar o Script
1. Na sua Planilha `TransitoDB`, vá no menu **Extensões** > **Apps Script**.
2. Apague qualquer código que estiver lá e cole o código abaixo:

```javascript
// --- INICIO DO SCRIPT ---
var FOLDER_ID = "COLE_O_ID_DA_PASTA_AQUI"; // <--- IMPORTANTE: COLOCAR O ID DA PASTA AQUI

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var imageUrl = "";
    
    // Processar Imagem se existir
    if (data.imageBase64) {
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.imageBase64), 'image/jpeg', "foto_" + data.timestamp + ".jpg");
      var file = folder.createFile(blob);
      
      // Tornar arquivo público para visualização na planilha
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = file.getUrl();
    }
    
    // Salvar na Planilha
    sheet.appendRow([
      data.id,
      new Date(), // DataHora automática do servidor
      data.userDate,
      data.userTime,
      data.region,
      data.neighborhood,
      data.street,
      data.reference,
      data.note,
      data.location.latitude,
      data.location.longitude,
      imageUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Função necessária para tratar CORS
function doOptions(e) {
  var output = ContentService.createTextOutput("");
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}
// --- FIM DO SCRIPT ---
```

3. Modifique a linha `var FOLDER_ID = "..."` com o ID copiado no Passo 1.2.
4. Clique no ícone de Salvar (Disquete).
5. Clique no botão azul **Implantar** (Deploy) > **Nova implantação**.
   - Tipo: **App da Web**.
   - Descrição: "Versão 1".
   - Executar como: **Eu** (seu email).
   - Quem pode acessar: **Qualquer pessoa** (Isso é crucial para o App funcionar sem login complexo).
6. Clique em **Implantar**. Autorize as permissões solicitadas.
7. Copie a **URL do App da Web** gerada (termina em `/exec`).

### Passo 1.4: Conectar o Frontend
1. No código fonte do App (arquivo `constants.ts`), substitua o valor de `GOOGLE_SCRIPT_URL` pela URL copiada acima.

---

## 2. Compilação e Hospedagem do App

Como não temos recursos para lojas de aplicativos (Play Store/Apple Store), usaremos a tecnologia PWA (Progressive Web App). O App será um site que se comporta como aplicativo.

### Opção Gratuita (Vercel/Netlify)
1. Coloque o código fonte deste projeto no GitHub.
2. Crie uma conta gratuita na Vercel ou Netlify.
3. Importe o projeto do GitHub.
4. O sistema irá compilar e gerar um Link Público (ex: `transito-app.vercel.app`).

## 3. Manual do Usuário (Instalação no Smartphone)

Para os 50 agentes, siga este procedimento:

1. Garanta que o celular tem internet (Wi-Fi ou Dados) na primeira vez.
2. Abra o **Google Chrome** (Android) ou **Safari** (iPhone).
3. Acesse o link gerado na etapa de hospedagem.
4. **Instalação**:
   - **Android**: Toque nos 3 pontinhos do menu > "Adicionar à Tela Inicial" > "Instalar".
   - **iPhone**: Toque no botão Compartilhar (quadrado com seta) > "Adicionar à Tela de Início".
5. Um ícone do App aparecerá junto aos outros aplicativos.

### Uso Offline
- O App funciona offline. Os agentes podem preencher formulários sem internet.
- Um indicador "Offline" (Vermelho) aparecerá.
- Ao clicar em "Registrar", o dado vai para uma fila.
- Quando o celular recuperar internet, abra o app e clique no botão laranja "Sync" no topo para enviar os dados pendentes.
