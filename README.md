  A rota /webLead  deve receber o JSON contendo as informações de todos os clientes que converteram na ferramenta RD Marketing e criar seu contato no CRM Bitrix24 para que possa ser tratado por uma das vendedoras na qual ficará responsável pelo  seu card e pelo seu contato.
    Após receber o lead do RD, verificamos se o cadastro do mesmo já existe no Bitrix através do campo ID do cliente no RD (O rd trata cada e-mail como um cliente único) e, caso contenha o campo CF_CNPJ preenchido (o rd  só terá essa informação preenchida quando o lead tiver vindo a partir de uma listagem exportada da Speedio ou através de uma landing page criada pelo marketing), verifica se esse cnpj já possui um cadastro de empresa no CRM.
    
    Seguimos 5 caminhos na automação. Em todos os leads serão distribuidos na pipeline MARKETING/TELEVENDAS:

      > Quando o lead não possui cadastro no Bitrix (contato) e não tem cnpj no rd: Criamos o cadastro da contato vinculamos à  um negócio no Bitrix, que será distribuido entre uma das vendedoras (Contato + Negócio).

      > Quando o lead já possui cadastro no Bitrix (contato) mas não possui cnpj no rd: Criamos um negócio com o cadastro já existente, adicionando as novas tags, que será distruibuido entre uma das vendedoras.

      > Quando o lead possui cadastro no Bitrix (contato) e possui cnpj no rd: Se o CNPJ informado for encontrado na base de cadastros de Empresas no Bitrix, vinculamos o contato do cliente à empresa em questão e criamos um negócio na pipeline que será direcionado a pessoa pela qual já é responsável pela empresa.

      > Quando o lead possui cadastro no Bitrix (contato) e possui cnpj no rd: Se o CNPJ informado não for encontrado na base, apenas é criado o contato do cliente e o negócio relacionado.

      > Quando não possui cadastro no Bitrix e possui cpnj: Se o CNPJ informado for encontrado na base de cadastros de Empresas no Bitrix, vinculamos o contato que foi criado à empresa em questão e criamos um negócio na pipeline que será direcionado a pessoa pela qual já é responsável pela empresa. 

