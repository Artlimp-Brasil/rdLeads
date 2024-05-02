const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const cors = require("cors");
require('dotenv/config');


app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => { res.send("rodando") });

app.post("/webLead", async (req, res) => {
  const json = req.body;

  if (json) {

    json.leads.forEach(async (lead) => {


      // Procura se há uma empresa já existente Cadastrada
      const getEmpresas = await axios.get(
        `${process.env.LINK_WEBHOOK}/crm.company.list.json?FILTER[UF_CRM_CNPJ]=${lead.cf_cnpj}`

      );

      // Procura se há contato já criado no bitrix com o mesmo ID de cliente do RD Marketing
      const retorno = await axios.get(
        `${process.env.LINK_WEBHOOK}/crm.contact.list.json?FILTER[UF_CRM_1713969606790]=${lead.uuid}`
      );

      // Se encontrar contato existente
      if (retorno.data.result.length > 0) {
        const contatoId = retorno.data.result[0].ID;

        // Atualiza o contato existente com as novas tags
        await axios.get(
          `${process.env.LINK_WEBHOOK}/crm.contact.update.json?ID=${contatoId}&FIELDS[UF_CRM_1711132565711]=${lead.tags}`
        );

        //Verifica se há uma empresa com o mesmo CNPJ criado 
        if (getEmpresas.data.result.length > 0) {

          const empresaId = getEmpresas.data.result[0].ID
          const responsavelID = getEmpresas.data.result[0].ASSIGNED_BY_ID

          //Atualiza o responsável pelo contato pelo mesmo responsável da empresa encontrada       
          await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.contact.update.json?id=${contatoId}&FIELDS[ASSIGNED_BY_ID]=${responsavelID}`
          );

          //Vincula o contato com a empresa encontrada
          await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.contact.company.add.json?ID=${contatoId}&FIELDS[COMPANY_ID]=${empresaId}`);
            
          // Cria card com contato existente e empresa vinculados  
          const cardId = await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.deal.add.json?FIELDS[TITLE]=${lead.name}&FIELDS[STAGE_ID]=C36:NEWFIELDS[CATEGORY_ID]=36&FIELDS[CONTACT_ID]=${contatoId}&FIELDS[COMPANY_ID]=${empresaId}`
          );
          // Log
          console.log('Lead enviado com sucesso. Card ID: ' + cardId.data.result + '. Contato Id: ' + contatoId)
        } else {

          // Cria card com o contato existente
          const cardId = await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.deal.add.json?FIELDS[TITLE]=${lead.name}&FIELDS[STAGE_ID]=C36:NEW&FIELDS[CATEGORY_ID]=36&FIELDS[CONTACT_ID]=${contatoId}`);

          // Log   
          console.log('Lead enviado com sucesso. Card ID: ' + cardId.data.result + '. Contato Id: ' + contatoId)
        }
      }

      else {
        //Se não encontrar contato existente > Cria novo contato 
        const novoContato = await axios.get(
          `${process.env.LINK_WEBHOOK}/crm.contact.add.json?FIELDS[NAME]=${lead.name}&FIELDS[EMAIL][0][VALUE]=${lead.email}&FIELDS[EMAIL][0][VALUE_TYPE]=WORK&FIELDS[PHONE][0][VALUE]=${lead.personal_phone}&FIELDS[PHONE][0][VALUE_TYPE]=WORK&FIELDS[UF_CRM_1711132565711]=${lead.tags}&FIELDS[UF_CRM_1713969606790]=${lead.uuid}&FIELDS[UF_CRM_1708975763880]=${lead.city}`);

        const novoContatoId = novoContato.data.result

        // Verifica se há uma empresa com o mesmo CNPJ cadastrado e vincula ao Contato criado         
        if (getEmpresas.data.result.length > 0) {
          const empresaId = getEmpresas.data.result[0].ID
          const responsavelID = getEmpresas.data.result[0].ASSIGNED_BY_ID

          // Se encontrado, vincula o contato à empresa encontrada
          await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.contact.company.add.json?ID=${novoContatoId}&FIELDS[COMPANY_ID]=${empresaId})`
          );

          //Atualiza o responsável pelo contato criado pelo mesmo responsável da empresa encontrada
          await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.contact.update.json?ID=${novoContatoId}&FIELDS[ASSIGNED_BY_ID]=${responsavelID}`
          );
          // Cria card com novo contato e empresa vinculados
          const cardId = await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.deal.add.json?FIELDS[TITLE]=${lead.name}&FIELDS[STAGE_ID]=C36:NEW&FIELDS[CATEGORY_ID]=36&FIELDS[COMPANY_ID]=${empresaId}&FIELDS[CONTACT_ID]=${novoContatoId}`
          );
          
          // Log
          console.log('Lead enviado com sucesso. Card ID: ' + cardId.data.result + '. Contato Id: ' + novoContatoId)
        } else {
          // Cria Novo Card Com Contato Criado
          const cardId = await axios.get(
            `${process.env.LINK_WEBHOOK}/crm.deal.add.json?FIELDS[TITLE]=${lead.name}&FIELDS[STAGE_ID]=C36:NEW&FIELDS[CATEGORY_ID]=36&FIELDS[CONTACT_ID]=${novoContatoId}`
          );

          // Log  
          console.log('Lead enviado com sucesso. Card ID: ' + cardId.data.result + '. Contato Id: ' + novoContatoId)
        }
      }

    });

    return res.status(200).json({
      message: "Lead enviado com sucesso!",
    });
  }
  return res.status(400).json({
    message: "Dados inválidos!",
  });
});

app.listen(9120, () => console.log("WebHook de Leads ativo!"));

