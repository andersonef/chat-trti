var io = require('socket.io');
var socket = io.listen(8080);
var logados = {};

socket.on('connection', function (client) {
    client.on('sendchat', function (dados) {
        dados = JSON.parse(dados);
        dados.lastActivity = new Date();
        socket.Pessoa = dados;

        if (!logados[dados.codigoPessoa]) {
            dados.openModal = true;
            logados[dados.codigoPessoa] = dados;
        }
        var evt = 'chat_with_' + dados.codigoPessoa;
        client.emit(evt, JSON.stringify(dados));
    });

    client.on('disconnect', function () {
        socket.Pessoa.lastActivity = new Date();
        setTimeout(function () {
            var segundos = (Date.now() - logados[socket.Pessoa.codigoPessoa].lastActivity.getTime()) / 1000;
            if (segundos < 30) return;

            delete logados[socket.Pessoa.codigoPessoa];
            socket.Pessoa.disconected = true;
            client.emit('sendchat', JSON.stringify(socket.Pessoa));
        }, 30000);
    });

    client.on('senddisconnect', function (dados) {
        dados = JSON.parse(dados);
        var evt = 'chat_with_' + dados.codigoPessoa;
        dados.message = dados.nomePessoa + ' ACABA DE SAIR DO BATE PAPO';
    });
})