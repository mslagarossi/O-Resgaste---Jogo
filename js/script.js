const start = () =>{
    $("#inicio").hide(); //forma de chamar a div com id inicio
    //Criando as imagens dentro do canvas
    $("#fundoGame").append("<div id='jogador' class='anima1'></div>"); //serão criados dentro do fundoGames
    $("#fundoGame").append("<div id='inimigo1' class='anima2'></div>");
    $("#fundoGame").append("<div id='inimigo2'></div>");//inimigo2 
    $("#inimigo2").hide();
    $("#fundoGame").append("<div id='amigo' class='anima3'></div>");
    $("#fundoGame").append("<div id='placar'></div>");
    $("#fundoGame").append("<div id='energia'></div>");
    $("#fundoGame").append("<div id='botaoSom'></div>");

    //Principais variáveis do jogo

    /******* SONS *********/
    var somDisparo=document.getElementById("somDisparo");
    var somExplosao=document.getElementById("somExplosao");
    var musica=document.getElementById("musica");
    var somGameover=document.getElementById("somGameover");
    var somPerdido=document.getElementById("somPerdido");
    var somResgate=document.getElementById("somResgate");
    //Para os sons, como são mais fáceis está sendo usado o js vanilla, pois muitos navegadores não rodam o jquery para audio

    var podeAtirar = true;
    var fimdejogo = false;
    var jogo = {};
    var velocidade = 5;
    var velocidadeCaminhao = 3;
    var posicaoY = parseInt(Math.random() * 334); //no math.random, você multiplica pelo número max que você quer
    var TECLA = {
        W: 87, //número reservado para a up arrow. **Ver pdf keycode no arquivo
        S: 83,
        D: 68
    }
    var energiaAtual=3;

    /******* VARS DA PONTUAÇÃO *******/
    var pontos=0;
    var salvos=0;
    var perdidos=0;
    var tempoParaAndar = 7000;
    
    jogo.pressionou = [];

    
    /************* Música em loop ************/
    musica.addEventListener("ended", function(){ musica.currentTime = 0; musica.play(); }, false);
    musica.play();
    // if($("#botaoSom").css("opacity") == 0.6){
    //     musica.pause();
    // } else{
    //     musica.play();
    // }

    //Verifica se o usuário pressionou alguma tecla	
	$(document).keydown(function(e){
        jogo.pressionou[e.which] = true;
    });
    
    $(document).keyup(function(e){
        jogo.pressionou[e.which] = false;
    });

    /************* Parar música ************/
    function pararSom(){

        if($("#botaoSom").css("opacity") == 0.6){
            console.log("ligarSom está funcionando");
            $("#botaoSom").css("background-image", "url(imgs/volumeOn.png)");
            $("#botaoSom").css("opacity", 1);
            musica.play();
            somDisparo.play();
            somExplosao.play();
            somPerdido.play();
            somResgate.play();
        } else if($("#botaoSom").css("opacity") == 1){
            console.log("som está parando");
            $("#botaoSom").css("background-image", "url(imgs/mute.png)");
            $("#botaoSom").css("opacity", 0.6);
            musica.pause();
            somDisparo.pause();
            somExplosao.pause();
            somGameover.pause();
            somPerdido.pause();
            somResgate.pause();
        }
    }
    $("#botaoSom").click(pararSom);

    /////////////// GAME LOOP //////////////////
    jogo.timer = setInterval(loop, 30); //setinterval chama a função a cada 30 msegundos
    function loop (){
        moveFundo();
        moveJogador(); //chama a função moveJogador
        moveInimigo1(); //chama a função moveInimigo1 que faz o inimigo mover
        // moveInimigo2(); //chama a função de andar do caminhão
        // let tempotempo = setTimeout(moveInimigo2, tempoParaAndar); //o caminhão só começa a andar após 3s
        setTimeout(moveInimigo2, tempoParaAndar);
        // reposicionaInimigo2()
        moveAmigo(); //chama a função para movimentar o amigo
        colisao(); //chama a função com a colisão do jogo
        placar(); //chama constantemente a atualização do placar
        energia(); //chama constantemente a atualização da barra de energia
    }
    //função que movimenta o fundo do jogo
    function moveFundo(){
        esquerda = parseInt($("#fundoGame").css("background-position"));
        $("#fundoGame").css("background-position", esquerda-1); //sempre irá ter o valor atualizado em -1 por ter sido chamado dentro do loop
    }

    //função que movimenta o jogador
    function moveJogador() {
        if (jogo.pressionou[TECLA.W]) {
            var topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top",topo-10); //modifica a posição do top do css em 10 para cimas
            
            //Limitando até onde o helicoptero consegue subir
            if(topo <= 0){
                $('#jogador').css('top', topo+10); //faz com que o helicoptero desça 10px e não consiga subir mais
            }
        }
        
        if (jogo.pressionou[TECLA.S]) {
            var topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top",topo+10);
            
            //Limitando a descida
            if (topo>=434){
                $("#jogador").css("top",topo-10);
            }
        }
        
        if (jogo.pressionou[TECLA.D]) {
            //Chama função Disparo
            disparo(); //Não entra em loop pois precisa apertar uma tecla para funcionar
        }
    
    } // fim da função movejogador()

    function moveInimigo1() {//move avião
        posicaoX = parseInt($("#inimigo1").css("left"));
        $("#inimigo1").css("left",posicaoX-velocidade);
        $("#inimigo1").css("top",posicaoY);
            
        if (posicaoX<=0) { //caso a posição left seja 0, o valor randomico é recriado
            posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);
            $("#inimigo1").css("top",posicaoY);
            if($("inimigo2").css("left",0 <= posicaoX && posicaoX >= 775)){ //Aumenta a velocidade do caminhão caso o aviao chegue ao final da tela
                velocidadeCaminhao = velocidadeCaminhao + 2;
                console.log("A velocidade foi aumentada para " + velocidadeCaminhao); //só para ver se está funcionando
            } else{
                velocidadeCaminhao = 3;
            }
            velocidadeCaminhao = velocidadeCaminhao;
            //if($("inimigo2").css("left",0 <= posicaoX && posicaoX >= 775))
        }
    } //Fim da função moveinimigo1()]

    function moveInimigo2() { //Move caminhão
        $("#inimigo2").show();
        if(velocidadeCaminhao<3){
            velocidadeCaminhao = 3;
        }

        posicaoX = parseInt($("#inimigo2").css("left"));
        $("#inimigo2").css("left",posicaoX-velocidadeCaminhao);
        
		if (posicaoX<=0) {
            $("#inimigo2").remove();
		    $("#inimigo2").css("left",775); //definindo o valor no eixo x em que irá retornar
            velocidadeCaminhao = 3;
            console.log("voltou para o valor " + velocidadeCaminhao);
            reposicionaInimigo2();
		}
    } // Fim da função moveinimigo2()

    function moveAmigo() {//move amigo
        posicaoX = parseInt($("#amigo").css("right"));
        $("#amigo").css("right",posicaoX+1);
                    
        if (posicaoX>906) {        
            $("#amigo").css("right",0); //quando chega ao 950, ele volta para a posição 0 a partir da direita
            salvos++;
            if($("#botaoSom").css("opacity") == 1){
                somResgate.play();
            }
        }
    } // fim da função moveamigo()

    function disparo() {
        if (podeAtirar == true) {
            if($("#botaoSom").css("opacity") == 1){
                somDisparo.play(); // Som do disparo
            }
            podeAtirar = false; //O jogador não pode realizar um novo tiro enquanto essa parte estiver sendo executada
            
            topo = parseInt($("#jogador").css("top")) //pega os locais do helicoptero em seguida adiciona uns valores para parecer que está saindo da frente
            posicaoX = parseInt($("#jogador").css("left"))
            tiroX = posicaoX + 190;
            topoTiro = topo + 38;
            $("#fundoGame").append("<div id='disparo'></div"); //cria um novo elemento a partir do fundoGame
            $("#disparo").css("top",topoTiro);
            $("#disparo").css("left",tiroX);
            
            var tempoDisparo=window.setInterval(executaDisparo, 30); //faz o tiro caminhar pelo canvas
        } //Fecha podeAtirar
     
        function executaDisparo() {
            posicaoX = parseInt($("#disparo").css("left")); //pega a posição atual do tiro em seguida add 15 para movimentação
            $("#disparo").css("left",posicaoX+15); 
    
            if (posicaoX>900) {       
                window.clearInterval(tempoDisparo);
                tempoDisparo=null; //zera o intervalo. Em alguns browsers é necessário escrever essa linha, caso contrário o intervalo não é cancelado
                $("#disparo").remove();
                podeAtirar=true;
            }
        } // Fecha executaDisparo()
    } // Fecha disparo()


    /******************* COLISÕES ******************/
    function colisao() {
        //Esse collision existe dentro do framework do jquery collision. Ele pega a colisão entre o 1º e o 2º parâmetros
        var colisao1 = ($("#jogador").collision($("#inimigo1"))); //colisão entre o 1º (#jogador) com o 2º (@inimigo1)
        var colisao2 = ($("#jogador").collision($("#inimigo2")));
        var colisao3 = ($("#disparo").collision($("#inimigo1")));
        var colisao4 = ($("#disparo").collision($("#inimigo2")));
        var colisao5 = ($("#jogador").collision($("#amigo")));
        var colisao6 = ($("#inimigo2").collision($("#amigo")));

        /******************* COLISÕES CONTRA INIMIGOS ******************/
        // jogador com o inimigo1    
        if (colisao1.length>0) {
            energiaAtual--;
            inimigo1X = parseInt($("#inimigo1").css("left"));
            inimigo1Y = parseInt($("#inimigo1").css("top"));
            explosao1(inimigo1X,inimigo1Y);
        
            if($("inimigo2").css("left",0 <= posicaoX && posicaoX >= 775)){ //aumenta a velocidade do caminhão
                velocidadeCaminhao = velocidadeCaminhao + 1;
                console.log("velocidade diminuída para " + velocidadeCaminhao); //só para ver se está funcionando
            }
            posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);
            $("#inimigo1").css("top",posicaoY);
        }

        // jogador com o inimigo2 
        if (colisao2.length>0) {
            energiaAtual--;
            inimigo2X = parseInt($("#inimigo2").css("left"));
            inimigo2Y = parseInt($("#inimigo2").css("top"));
            explosao2(inimigo2X,inimigo2Y);
            $("#inimigo2").remove();
            reposicionaInimigo2();
        }


        /******************* DISPAROS CONTRA INIMIGOS ******************/
        // Disparo com o inimigo1
        if (colisao3.length>0) {
            pontos=pontos+100;
            velocidade = velocidade + 0.3;
            inimigo1X = parseInt($("#inimigo1").css("left"));
            inimigo1Y = parseInt($("#inimigo1").css("top"));
                
            explosao1(inimigo1X,inimigo1Y); //está reaproveitando a explosao1 pois são iguais
            $("#disparo").css("left",950); /*mais para cima está configurado na função disparo, que o disparo some após ultrapassar o width de 900, por isso
            colocando um valor maior que 900 força o código a rodar, apagando o disparo*/
            
            if($("inimigo2").css("left",0 <= posicaoX && posicaoX >= 775)){ //diminui a velocidade do caminhão
                velocidadeCaminhao = velocidadeCaminhao - 2;
                console.log("velocidade diminuída para " + velocidadeCaminhao); //só para ver se está funcionando
            }

            posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);
            $("#inimigo1").css("top",posicaoY);
        }

        // Disparo com o inimigo2
        if (colisao4.length>0) {
            pontos=pontos+50;
            inimigo2X = parseInt($("#inimigo2").css("left"));
            inimigo2Y = parseInt($("#inimigo2").css("top"));
            $("#inimigo2").remove();
        
            explosao2(inimigo2X,inimigo2Y);
            $("#disparo").css("left",950);
            reposicionaInimigo2();
        }

        /******************* COLISÕES CONTRA AMIGO ******************/

        //Inimigo2 com o amigo
        if (colisao6.length>0) {
            perdidos++;
            amigoX = parseInt($("#amigo").css("left"));
            amigoY = parseInt($("#amigo").css("top"));
            explosao3(amigoX,amigoY);
            $("#amigo").remove();
                    
            reposicionaAmigo();
        }
    } //Fim da função colisao()


    /******************* EXPLOSÕES ******************/
    //Explosão 1
    function explosao1(inimigo1X,inimigo1Y) {
        if($("#botaoSom").css("opacity") == 1){
            somExplosao.play(); //som da explosão
        }
        
        $("#fundoGame").append("<div id='explosao1'></div"); //cria algo dentro do canvas no espaço determinado do fundoGame
        $("#explosao1").css("background-image", "url(imgs/explosao.png)");
        var div=$("#explosao1");
        div.css("left", inimigo1X); //o 2º parametro é o valor do 1º parametro
        div.css("top", inimigo1Y);
        div.animate({width:200, opacity:0}, "slow");
        //Mesmo que o width original seja menor, isso indica que o tamanho dela irá crescer até 200px
        
        var tempoExplosao=window.setInterval(removeExplosao, 1000); //chama a função para remover a explosao
	
		function removeExplosao() {
			div.remove(); //remove a div da tela
			window.clearInterval(tempoExplosao);
			tempoExplosao = null;
		}
	} // Fim da função explosao1()

    //Explosão2
	function explosao2(inimigo2X,inimigo2Y) {
        if($("#botaoSom").css("opacity") == 1){
            somExplosao.play(); //som da explosão
        }
        
        $("#fundoGame").append("<div id='explosao2'></div");
        $("#explosao2").css("background-image", "url(imgs/explosao.png)");
        var div2=$("#explosao2");
        div2.css("top", inimigo2Y);
        div2.css("left", inimigo2X);
        div2.animate({width:200, opacity:0}, "slow");
        
        var tempoExplosao2 = window.setInterval(removeExplosao2, 1000);
        
        function removeExplosao2() {
            div2.remove();
            window.clearInterval(tempoExplosao2);
            tempoExplosao2=null;   
        }        
    } // Fim da função explosao2()

    //Explosão3
    function explosao3(amigoX,amigoY) {
        if($("#botaoSom").css("opacity") == 1){
            somPerdido.play(); //som do amigo morrendo
        }
        
        $("#fundoGame").append("<div id='explosao3' class='anima4'></div");
        $("#explosao3").css("top",amigoY);
        $("#explosao3").css("left",amigoX);

        var tempoExplosao3=window.setInterval(resetaExplosao3, 1000);

        function resetaExplosao3() {
            $("#explosao3").remove();
            window.clearInterval(tempoExplosao3);
            tempoExplosao3=null;
        }
    } // Fim da função explosao3


    /******************* REPOSIÇÕES ******************/
    //Reposiciona Inimigo2
	function reposicionaInimigo2() {
        var tempoColisao4 = window.setInterval(reposiciona4, 7000);
            
        function reposiciona4() {
            if($("#amigo").css("right",200)){
            window.clearInterval(tempoColisao4);
            tempoColisao4 = null;    
            if (fimdejogo == false) { //impede que o inimigo respawne após a tela de fim de jogo
                velocidadeCaminhao = 3; //Velocidade realmente volta para o 3
                $("#fundoGame").append("<div id=inimigo2></div");
                $("#inimigo2").show();
                moveInimigo2();
            }
            }        
        }	
    }

    //Reposiciona Amigo
	function reposicionaAmigo() {
        var tempoAmigo = window.setInterval(reposiciona6, 6000);
        function reposiciona6() {
            window.clearInterval(tempoAmigo);
            tempoAmigo = null;
            if (fimdejogo == false) {
                $("#fundoGame").append("<div id='amigo' class='anima3'></div>");
            }   
        }
    } // Fim da função reposicionaAmigo()

    /******************* PLACAR COM AS PONTUAÇÕES ******************/
    function placar() {
	
        $("#placar").html("<h2> Pontos: " + pontos + " Salvos: " + salvos + " Perdidos: " + perdidos + "</h2>");
        
    } //fim da função placar()

    /******************* BARRA DE ENERGIA ******************/
    function energia() {
		if (energiaAtual==3) {	
			$("#energia").css("background-image", "url(imgs/energia3.png)");
		}
		if (energiaAtual==2) {	
			$("#energia").css("background-image", "url(imgs/energia2.png)");
		}
		if (energiaAtual==1) {	
			$("#energia").css("background-image", "url(imgs/energia1.png)");
		}
		if (energiaAtual==0) {
			$("#energia").css("background-image", "url(imgs/energia0.png)");
			gameOver();
		}
	} // Fim da função energia()

    /******************* GAME OVER ******************/
	function gameOver() {
        fimdejogo=true; //Amigo não será reposicionado caso entre en contato com inimigo2
        musica.pause();
        if($("#botaoSom").css("opacity") == 1){
            somGameover.play();
        }
        
        window.clearInterval(jogo.timer); //para a execução do setInterval(loop, 30)
        jogo.timer=null;
        
        $("#jogador").remove();
        $("#inimigo1").remove();
        $("#inimigo2").remove();
        $("#inimigo3").remove();
        $("#botaoSom").remove();
        $("#amigo").remove();
        
        $("#fundoGame").append("<div id='fim'></div>"); //cria a div
        
        //abaixo é colocado o valor da div criada acima
        $("#fim").html("<h1> Game Over </h1><p>Sua pontuação foi: " + pontos + "</p>" + "<div id='reinicia' onClick=reiniciaJogo()><h3>Jogar Novamente</h3></div>");
    } // Fim da função gameOver();
    
}

/******************* REINICIA O JOGO ******************/
function reiniciaJogo() {
	somGameover.pause(); //pausa a musica do game over
	$("#fim").remove(); //Rremove a tela de fim
	start(); //inicia o jogo novamente
	
} //Fim da função reiniciaJogo
