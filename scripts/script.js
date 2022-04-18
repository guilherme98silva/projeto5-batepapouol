// Variáveis globais 

const UOL_API = "https://mock-api.driven.com.br/api/v6/uol";
const TEMPOATUALIZACAOCONEXAO = 5000;
const TEMPOOBTERMENSAGENS = 3000;
let usuario = null;

//FUNÇÕES

/* Pergunta o nome do usuário logo que a página é carregada */
function obterNomeUsuario() {
  usuario = prompt("digite o seu nome");
  const promise = axios.post(`${UOL_API}/participants`, { name: usuario });
  promise.then(() => { 
    obterMensagens(); 

    setInterval(obterMensagens, TEMPOOBTERMENSAGENS);
    setInterval (manterUsuarioConectado, TEMPOATUALIZACAOCONEXAO);
  });
  promise.catch(erro => obterNomeUsuario());
}

/* Verifica se o usuário ainda está na sala */
function manterUsuarioConectado() {
  const promise = axios.post(`${UOL_API}/status`, { name: usuario });
  promise.then(resposta => console.info("Usuário continua ativo"));
  promise.catch(erro => {
    console.error(erro.response);
    alert("O usuário foi desconectado da sala.");
    window.location.reload();
  })
}
 
/* Obtém as mensagens do servidor */
function obterMensagens() {
  const promise = axios.get(`${UOL_API}/messages`);
  promise.then(resposta => {
    console.log(resposta.data);
    renderizarMensagens(resposta.data);
    focarNaUltimaMensagem();
  });
  promise.catch( erro => {
    console.error(erro.response);
    alert("Erro ao tentar obter mensagens.");
  })
}

/* Mostra as mensagens na tela */
function renderizarMensagens(mensagens) {
  const ul = document.querySelector("main ul");
  ul.innerHTML = "";

  mensagens.forEach( mensagem => {
    const tipo = mensagem.type;
    const remetente = mensagem.from;
    const destinatario = mensagem.to;
    const horario = mensagem.time;
    const texto = mensagem.text;

    let mensagemHTML = null;
    //Alerta de entrada/saída da sala
    if(tipo === "status") {
      mensagemHTML = `
      <li class="mensagem status">
        <span class="horario">(${horario})</span>
        <span class="pessoas"><b>${remetente}</b></span>
        <span class="texto">${texto}</span>
      </li>
      `
    } else {
      //Mensagem pública
      if(tipo === "message") {
        mensagemHTML = `
        <li class="mensagem publica">
        <span class="horario">(${horario})</span>
          <span class="pessoas"><b>${remetente}</b> para <b>${destinatario}</b>: </span>
          <span class="texto">${texto}</span>
        </li>
        `;
      } else {
        //Mensagem reservada
        if(remetente === usuario || destinatario === usuario){
          mensagemHTML = `
          <li class="mensagem reservada">
          <span class="horario">(${horario})</span>
            <span class="pessoas"><b>${remetente}</b> reservadamente para <b>${destinatario}</b>: </span>
            <span class="texto">${texto}</span>
          </li>
          `;
        }
      }
    }

    if(mensagemHTML !== null) {
      ul.innerHTML += mensagemHTML;
    }
  })
}
/* Arrasta a tela para a última mensagem enviada */
function focarNaUltimaMensagem() {
  const ul = document.querySelector("main ul");
  const ultimaMensagem = ul.lastElementChild;
  ultimaMensagem.scrollIntoView();
}

/*Envia uma mensagem do usuário */
function enviarMensagem() {
  const input = document.querySelector("footer input");
  const mensagem = input.value;
  const promise = axios.post(`${UOL_API}/messages`, {
    from: usuario,
    to: "Todos",
    text: mensagem,
    type: "message"
  });

  promise.then(function(response){
    console.log("Mensagem enviada com sucesso!");
  });
  promise.catch(function (erro) {
    alert("Erro ao enviar mensagem");
  });

  input.value = "";
}

obterNomeUsuario();