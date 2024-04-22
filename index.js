const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.post("/webLead", async (req, res) => {
  const json = req.body;
  
  if (json) { 
    json.leads.forEach(async (lead) => {
      const retorno = await axios.get(
        `${process.env.LINK_WEBHOOK_CONTACTS}?FIELDS[NAME]=${lead.name}&FIELDS[EMAIL][0][VALUE]=${lead.email}&FIELDS[EMAIL][0][VALUE_TYPE]=WORK&FIELDS[PHONE][0][VALUE]=${lead.personal_phone}&FIELDS[PHONE][0][VALUE_TYPE]=WORK`
      );
      console.log(retorno.data.result);
      await axios.get(
        `${process.env.LINK_WEBHOOK_DEALS}?FIELDS[TITLE]=${lead.name}&FIELDS[STAGE_ID]=C36:NEW&FIELDS[CATEGORY_ID]=36&FIELDS[CONTACT_ID]=${retorno.data.result}`,
      console.log('Lead enviado com sucesso')
      );
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
