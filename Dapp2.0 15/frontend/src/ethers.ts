import { ethers } from "ethers";
import TuringABI from "./Turing.json";

declare global {
  interface Window { ethereum: ethers.Eip1193Provider }
}

// Endereço do contrato implantado
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

// Função para obter o contrato
const getContract = async () => {
  // Verifica se o MetaMask está instalado
  if (!window.ethereum) {
    throw new Error("MetaMask não encontrado! Instale para continuar.");
  }

  // Cria o provedor de conexão com a rede Ethereum
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Obtém o signer (a conta que vai interagir com o contrato)
  const signer = await provider.getSigner();

  // Cria o objeto do contrato
  const contract = new ethers.Contract(contractAddress, TuringABI.abi, signer);

  return contract; // Retorna o contrato para ser utilizado em outros lugares
};

// Chama a função assíncrona para obter o contrato
let contract: ethers.Contract;

getContract().then((contr) => {
  contract = contr; // Armazena o contrato na variável global para uso posterior
  // Agora você pode usar o contrato, por exemplo, em outros arquivos ou componentes.
  console.log("Contrato carregado com sucesso:", contract);
}).catch((err) => {
  console.error("Erro ao carregar o contrato:", err);
});

// Exporta a variável global, que pode ser utilizada em outros módulos
export { contract };
