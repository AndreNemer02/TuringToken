import React, { useEffect, useState } from "react";
import { contract } from "./ethers"; // Importa o contrato já configurado
import { ethers, parseUnits } from "ethers";


const App = () => {
  const [nomes, setNomes] = useState<string[]>([]);
  const [enderecos, setEnderecos] = useState<Map<string, string>>(new Map());
  const [votacaoAtiva, setVotacaoAtiva] = useState<boolean>(true); // Estado para saber se a votação está ativa
  const [nomeSelecionado, setNomeSelecionado] = useState<string>(""); // Nome selecionado
  const [quantidade, setQuantidade] = useState<string>("0"); // Quantidade inserida pelo usuário
  const [ranking, setRanking] = useState<{ nome: string, saldo: bigint }[]>([]);


  // Função para ligar a votação (chama o método ligarVotacao no contrato)
  const ligarVotacao = async () => {
    try {
      const tx = await contract.ligarVotacao(); // Chama a função ligarVotacao do contrato
      await tx.wait(); // Espera a transação ser confirmada
      setVotacaoAtiva(true); // Atualiza o estado para mostrar que a votação está ativa
      console.log("Votação ativada!");
    } catch (err) {
      console.error("Erro ao ligar a votação:", err);
    }
  };

  // Função para desligar a votação (chama o método desligarVotacao no contrato)
  const desligarVotacao = async () => {
    try {
      const tx = await contract.desligarVotacao(); // Chama a função desligarVotacao do contrato
      await tx.wait(); // Espera a transação ser confirmada
      setVotacaoAtiva(false); // Atualiza o estado para mostrar que a votação não está mais ativa
      console.log("Votação desativada!");
    } catch (err) {
      console.error("Erro ao desligar a votação:", err);
    }
  };

  // Função para obter os nomes e endereços
  useEffect(() => {
    const getNomes = async () => {
      const nomesArray = [];
      for (let i = 0; i < 19; i++) {
        try {
          const nome = await contract.getNomes(i); // Acessa diretamente a variável pública nomes
          nomesArray.push(nome);
        } catch (err) {
          console.error("Erro ao obter nome:", err);
        }
      }
      setNomes(nomesArray);
    };

    getNomes();
  }, []); // Executa apenas uma vez quando o componente é montado

  useEffect(() => {
    const getEnderecos = async () => {
      const enderecosMap = new Map();
      for (let i = 0; i < nomes.length; i++) {
        try {
          const endereco = await contract.nomeParaEndereco(nomes[i]); // Acessa o mapping nomeParaEndereco
          enderecosMap.set(nomes[i], endereco);
        } catch (err) {
          console.error("Erro ao obter endereço:", err);
        }
      }
      setEnderecos(enderecosMap);
    };

    if (nomes.length > 0) {
      getEnderecos();
    }
  }, [nomes]);

// Função para atualizar o ranking
const atualizarRanking = async () => {
  try {
    const novoRanking = [];

    for (let nome of nomes) {
      const endereco = await contract.nomeParaEndereco(nome);
      const saldoBN = await contract.balanceOf(endereco);

      // Converte para BigInt usando .toString()
      const saldo = BigInt(saldoBN.toString());

      novoRanking.push({ nome, saldo });
    }

    // Ordena corretamente usando BigInt
    novoRanking.sort((a, b) => (b.saldo > a.saldo ? 1 : -1));

    setRanking(novoRanking);
  } catch (error) {
    console.error("Erro ao atualizar ranking:", error);
  }
};

  // Função para fazer a chamada da função issueToken
  const emitirToken = async () => {
    if (!nomeSelecionado || !quantidade) return;

    const quantidadeEmWei = parseFloat(quantidade) * 10 ** 18; // Converte a quantidade para o formato correto

    try {
      const tx = await contract.issueToken(nomeSelecionado, quantidadeEmWei);
      await tx.wait();
      console.log("Token emitido!");
      await atualizarRanking(); // Atualiza o ranking após emitir o token
    } catch (err) {
      console.error("Erro ao emitir token:", err);
    }
  };

  // Função para fazer a chamada da função vote
  const votar = async () => {
    if (!nomeSelecionado || !quantidade) return;

    const quantidadeEmWei = parseFloat(quantidade) * 10 ** 18; // Converte a quantidade para o formato correto

    try {
      const tx = await contract.vote(nomeSelecionado, quantidadeEmWei);
      await tx.wait();
      console.log("Voto realizado!");
      await atualizarRanking(); // Atualiza o ranking após votar
    } catch (err) {
      console.error("Erro ao votar:", err);
    }
  };

  // Escuta os eventos de transação para atualizar o ranking automaticamente
  useEffect(() => {
    contract.on("TokenEmitido", async () => {
      await atualizarRanking();
    });
    contract.on("votoFeito", async () => {
      await atualizarRanking();
    });

    // Cleanup: Remover os listeners quando o componente for desmontado
    return () => {
      contract.removeAllListeners("TokenEmitido");
      contract.removeAllListeners("votoFeito");
    };
  }, [nomes]);

  return (
    <div>
      <h1>Lista de Nomes e Endereços</h1>
      <ul>
        {nomes.map((nome, index) => (
          <li key={index}>
            Nome: {nome}, Endereço: {enderecos.get(nome) || "Carregando..."}
          </li>
        ))}
      </ul>

      <h2>Controle de Votação</h2>
      <button onClick={ligarVotacao} disabled={votacaoAtiva}>
        {votacaoAtiva ? "Votação Ativa" : "Ativar Votação"}
      </button>
      <button onClick={desligarVotacao} disabled={!votacaoAtiva}>
        {votacaoAtiva ? "Desativar Votação" : "Votação Desativada"}
      </button>

      <p>Status da Votação: {votacaoAtiva ? "Ativa" : "Desativada"}</p>

      <h2>Emitir Tokens</h2>
      <select
        value={nomeSelecionado}
        onChange={(e) => setNomeSelecionado(e.target.value)}
      >
        <option value="">Selecione um nome</option>
        {nomes.map((nome, index) => (
          <option key={index} value={nome}>
            {nome}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        max="2"
        step="0.01"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <button onClick={emitirToken}>Emitir Token</button>

      <h2>Votação</h2>
      <select
        value={nomeSelecionado}
        onChange={(e) => setNomeSelecionado(e.target.value)}
      >
        <option value="">Selecione um candidato</option>
        {nomes.map((nome, index) => (
          <option key={index} value={nome}>
            {nome}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        max="2"
        step="0.01"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <button onClick={votar}>Votar</button>

      <h2>Ranking de Turings</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Saldo de Turings</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr key={index}>
              <td>{item.nome}</td>
              <td>{parseUnits(String(item.saldo), 18)} Turing</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
