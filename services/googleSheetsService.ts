import { TimePunch, PunchType, WorkedHours, ApiResponse } from '../types';

/*
 * =================================================================================================
 * |                     PASSO A PASSO: CONFIGURANDO O GOOGLE APPS SCRIPT (BACKEND)                |
 * =================================================================================================
 *
 * O aplicativo precisa de um "backend" para se comunicar com sua Planilha Google.
 * Você vai configurar isso usando o Google Apps Script, que é gratuito e roda nos servidores do Google.
 *
 * SIGA ESTES PASSOS COM ATENÇÃO:
 *
 * 1. FAÇA UMA CÓPIA DA PLANILHA MODELO:
 *    a. Acesse o link: https://docs.google.com/spreadsheets/d/1kgMqFScLjovlIQpS4_uMQYRXzl-w15JxKbjQyWTA9Co/edit
 *    b. No menu, vá em "Arquivo" > "Fazer uma cópia". Dê um nome para sua planilha e salve na sua conta Google.
 *
 * 2. PEGUE O ID DA *SUA* CÓPIA DA PLANILHA:
 *    a. Na sua cópia, olhe a URL no navegador.
 *    b. O ID é a parte longa entre "/d/" e "/edit".
 *       Exemplo: Na URL "https://docs.google.com/spreadsheets/d/AQUI_ESTA_O_ID/edit", o ID é "AQUI_ESTA_O_ID".
 *    c. Copie esse ID. Você vai precisar dele em breve.
 *
 * 3. ABRA O EDITOR DE SCRIPT NA *SUA* PLANILHA:
 *    a. Com a *sua cópia* da planilha aberta, vá no menu "Extensões" > "Apps Script".
 *    b. Uma nova aba do navegador será aberta com o editor de scripts.
 *
 * 4. COLE E EDITE O CÓDIGO ABAIXO:
 *    a. Apague todo o código que estiver na caixa de texto (geralmente uma função `myFunction`).
 *    b. Cole TODO o código que está entre `/* --- CÓDIGO DO GOOGLE APPS SCRIPT --- * /` e `/* --- FIM DO CÓDIGO DO GOOGLE APPS SCRIPT --- * /` abaixo.
 *    c. **MUITO IMPORTANTE:** Encontre a primeira linha do código que você colou: `const SPREADSHEET_ID = '...';`
 *    d. Substitua o ID que está entre aspas pelo ID da *SUA* planilha que você copiou no passo 2.
 *
 * 5. SALVE O PROJETO:
 *    Clique no ícone de disquete (Salvar projeto).
 *
 * 6. IMPLANTE O SCRIPT COMO UM APLICATIVO WEB:
 *    a. No canto superior direito, clique no botão azul "Implantar" e depois em "Nova implantação".
 *    b. Ao lado do ícone de engrenagem ("Selecionar tipo"), clique e escolha "App da Web".
 *    c. Na descrição, você pode colocar "Backend Pimenta da Terra".
 *    d. Em "Executar como", selecione "Eu".
 *    e. Em "Quem pode acessar", selecione "Qualquer pessoa". (IMPORTANTE: Isso permite que o app acesse a planilha sem pedir login).
 *    f. Clique no botão "Implantar".
 *
 * 7. AUTORIZE A EXECUÇÃO:
 *    a. O Google pedirá permissão para o script acessar sua planilha. Clique em "Autorizar acesso".
 *    b. Escolha sua conta do Google.
 *    c. Você pode ver um aviso "O Google não verificou este app". Isso é normal. Clique em "Avançado" e depois em "Acessar [nome do projeto] (não seguro)".
 *    d. Na próxima tela, role para baixo e clique em "Permitir".
 *
 * 8. COPIE A URL DO APP DA WEB:
 *    a. Após a implantação, uma janela aparecerá com a "URL do app da Web".
 *    b. Clique no botão "Copiar" ao lado dessa URL.
 *
 * 9. COLE A URL NO CÓDIGO DO APLICATIVO:
 *    a. Volte para este arquivo (`services/googleSheetsService.ts`).
 *    b. Substitua o valor da constante `APPS_SCRIPT_URL` (abaixo) pela URL que você acabou de copiar.
 *
 * SE VOCÊ ATUALIZAR O CÓDIGO DO SCRIPT NO FUTURO:
 * - Você deve fazer uma NOVA implantação.
 * - Clique em "Implantar" > "Gerenciar implantações".
 * - Selecione sua implantação ativa, clique no ícone de lápis (Editar).
 * - Em "Versão", escolha "Nova versão".
 * - Clique em "Implantar". A URL permanecerá a mesma.
 *
 */

// Fix: The Google Apps Script code block was not properly commented out, causing compilation errors. It is now wrapped in a multi-line comment.
/* --- CÓDIGO DO GOOGLE APPS SCRIPT --- (COPIE TUDO DAQUI PARA BAIXO ATÉ O FIM DO BLOCO)
// =========================================================================================
// | !!! PASSO 4.d - IMPORTANTE !!!                                                        |
// | SUBSTITUA O ID ABAIXO PELO ID DA *SUA* CÓPIA DA PLANILHA GOOGLE (ver passo 2).         |
// =========================================================================================
const SPREADSHEET_ID = '1fMJnyyssMk2GfuxQO4GbPVXrBeiKLBOVBD2KM0XWcuQ';

function doGet(e) {
  const action = e.parameter.action;
  let response;

  try {
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
      if (err.message.includes('permissão') || err.message.includes('permission')) {
        throw new Error(`FALHA DE PERMISSÃO AO ABRIR PLANILHA. VERIFIQUE: 1) Se o 'SPREADSHEET_ID' no script está correto e aponta para a *SUA CÓPIA* da planilha. 2) Se a conta Google que você usou para implantar o script tem permissão para editar essa planilha. O ID configurado é: '${SPREADSHEET_ID}'`);
      }
      throw err; // Re-throw other errors
    }

    switch (action) {
      case 'getEmployees':
        response = createSuccessResponse(getEmployees(ss));
        break;
      case 'getPunchesForDay':
        const name = e.parameter.name;
        const date = e.parameter.date;
        response = createSuccessResponse(getPunchesForDay(ss, name, date));
        break;
      case 'getWorkedHours':
        response = createSuccessResponse(getWorkedHours(ss));
        break;
      default:
        response = createErrorResponse('Invalid action specified');
    }
  } catch (error) {
    response = createErrorResponse(error.message);
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let response;
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
       if (err.message.includes('permissão') || err.message.includes('permission')) {
        throw new Error(`FALHA DE PERMISSÃO AO ABRIR PLANILHA. VERIFIQUE: 1) Se o 'SPREADSHEET_ID' no script está correto e aponta para a *SUA CÓPIA* da planilha. 2) Se a conta Google que você usou para implantar o script tem permissão para editar essa planilha. O ID configurado é: '${SPREADSHEET_ID}'`);
      }
      throw err;
    }

    switch (action) {
      case 'recordTime':
        const payload = request.payload;
        response = createSuccessResponse(recordTime(ss, payload));
        break;
      default:
        response = createErrorResponse('Invalid action specified');
    }
  } catch (error) {
    response = createErrorResponse(error.message);
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function createSuccessResponse(data) { return { success: true, data: data }; }
function createErrorResponse(message) { return { success: false, error: message }; }

function getEmployees(ss) {
  const sheet = ss.getSheetByName('Colaboradores');
  if (!sheet) throw new Error("Sheet 'Colaboradores' not found.");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(String);
}

function recordTime(ss, payload) {
  const { name, type, date, time } = payload;
  const sheet = ss.getSheetByName('Registro de Ponto');
  if (!sheet) throw new Error("Sheet 'Registro de Ponto' not found.");

  const columnMap = { 'Entrada': 4, 'Saída Almoço': 5, 'Entrada Almoço': 6, 'Saída': 7 };
  const targetColumn = columnMap[type];
  if (!targetColumn) throw new Error(`Invalid punch type: ${type}`);

  // Lock the script to prevent race conditions if two people clock in at the same time on a new day.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds.

  try {
    const data = sheet.getDataRange().getValues();
    let dateExists = false;
    // Check if any entry for the current date already exists. Start from the end for efficiency.
    for (let i = data.length - 1; i >= 1; i--) {
      const rowDate = data[i][0];
      const formattedRowDate = rowDate instanceof Date ? Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy") : String(rowDate);
      if (formattedRowDate === date) {
        dateExists = true;
        break;
      }
    }

    // If it's the first punch of the day, populate the sheet with all employees for that date.
    // This pre-fills the names in Column C and the date in Column A.
    if (!dateExists) {
      const employees = getEmployees(ss);
      if (employees.length > 0) {
        const newRows = employees.map(employeeName => [date, '', employeeName, '', '', '', '']);
        const startRow = sheet.getLastRow() + 1;
        // Set all new rows in one operation for performance
        sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);

        // Find the last valid row in the original data to copy formulas from.
        let formulaSourceRow = -1;
        for (let i = data.length - 1; i >= 1; i--) {
          const formulaCheckRange = sheet.getRange(i + 1, 8, 1, 2);
          const formulasInCheck = formulaCheckRange.getFormulasR1C1();
          if (formulasInCheck[0][0] || formulasInCheck[0][1]) {
            formulaSourceRow = i + 1;
            break;
          }
        }
        
        // If a row with formulas was found, copy them to all new rows.
        if (formulaSourceRow !== -1) {
          const sourceRange = sheet.getRange(formulaSourceRow, 8, 1, 2);
          const destinationRange = sheet.getRange(startRow, 8, newRows.length, 2);
          sourceRange.copyTo(destinationRange);
        }
      }
    }
    
    // Now that rows are guaranteed to exist, find the correct one and update it.
    const updatedData = sheet.getDataRange().getValues();
    let targetRow = -1;

    for (let i = updatedData.length - 1; i >= 1; i--) {
      const rowDate = updatedData[i][0];
      const rowName = updatedData[i][2];
      const formattedRowDate = rowDate instanceof Date ? Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy") : String(rowDate);
      if (formattedRowDate === date && rowName === name) {
        targetRow = i + 1; // 1-based index
        break;
      }
    }

    if (targetRow !== -1) {
      sheet.getRange(targetRow, targetColumn).setValue(time);
    } else {
      // Fallback: If employee wasn't in the initial list, add them now.
      sheet.appendRow([date, '', name]);
      const newRowIndex = sheet.getLastRow();
      sheet.getRange(newRowIndex, targetColumn).setValue(time);
      if (newRowIndex > 2) {
        const sourceRange = sheet.getRange(newRowIndex - 1, 8, 1, 2);
        sourceRange.copyTo(sheet.getRange(newRowIndex, 8, 1, 2));
      }
    }

    return { type, time };

  } finally {
    lock.releaseLock();
  }
}

function getPunchesForDay(ss, name, date) {
  const sheet = ss.getSheetByName('Registro de Ponto');
  if (!sheet) throw new Error("Sheet 'Registro de Ponto' not found.");
  const data = sheet.getDataRange().getValues();
  const punches = [];

  for (let i = data.length - 1; i >= 1; i--) {
    const rowDate = data[i][0];
    const rowName = data[i][2];
    const formattedRowDate = rowDate instanceof Date ? Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy") : String(rowDate);
    if (formattedRowDate === date && rowName === name) {
      const times = data[i].slice(3, 7); // Columns D, E, F, G
      const types = ['Entrada', 'Saída Almoço', 'Entrada Almoço', 'Saída'];
      
      times.forEach((timeValue, index) => {
        if (timeValue instanceof Date) {
          punches.push({ type: types[index], time: Utilities.formatDate(timeValue, ss.getSpreadsheetTimeZone(), "HH:mm") });
        } else if (timeValue) {
           punches.push({ type: types[index], time: String(timeValue) });
        }
      });
      break;
    }
  }
  return punches;
}

function getWorkedHours(ss) {
  const sheet = ss.getSheetByName('Horas trabalhadas');
  if (!sheet) throw new Error("Sheet 'Horas trabalhadas' not found.");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const range = sheet.getRange(2, 1, lastRow - 1, 3);
  const values = range.getDisplayValues(); // Get formatted strings
  return values.map(row => ({ employee: row[0], monthYear: row[1], totalHours: row[2] }));
}
--- FIM DO CÓDIGO DO GOOGLE APPS SCRIPT --- */


// =================================================================================================
// |    !!! IMPORTANTE !!!                                                                         |
// |    COLE A URL DO SEU APP DA WEB (OBTIDA NO PASSO 8) NA LINHA ABAIXO.                          |
// =================================================================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-ACwi-SGkgqjBnM6fLt1ZxUvx0791amlDLjQakwLe35RVlYTZ14DwcGzfiFFhF-2r/exec';

// Helper function to handle date formatting
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to handle time formatting
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getEmployees = async (): Promise<string[]> => {
  const response = await fetch(`${APPS_SCRIPT_URL}?action=getEmployees`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const result: ApiResponse<string[]> = await response.json();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to fetch employees');
};

export const getPunchesForDay = async (employeeName: string): Promise<TimePunch[]> => {
    const today = formatDate(new Date());
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getPunchesForDay&name=${encodeURIComponent(employeeName)}&date=${encodeURIComponent(today)}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const result: ApiResponse<TimePunch[]> = await response.json();
    if(result.success && result.data) {
        return result.data;
    }
    // Return empty array if no punches found, which is not an error
    if (!result.success && result.error?.includes("No records found")) {
        return [];
    }
    throw new Error(result.error || 'Failed to fetch punches');
};


export const recordTime = async (employeeName: string, punchType: PunchType): Promise<TimePunch> => {
  const now = new Date();
  const punchData = {
    name: employeeName,
    type: punchType,
    date: formatDate(now),
    time: formatTime(now),
  };

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    // 'text/plain' is required for 'no-cors' mode with Apps Script redirects
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'recordTime',
      payload: punchData,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const result: ApiResponse<TimePunch> = await response.json();

  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to record time');
};


export const getWorkedHours = async (): Promise<WorkedHours[]> => {
  const response = await fetch(`${APPS_SCRIPT_URL}?action=getWorkedHours`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const result: ApiResponse<WorkedHours[]> = await response.json();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to fetch worked hours');
};