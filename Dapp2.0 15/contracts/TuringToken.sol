// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Turing is ERC20 {

    address public constant PROFESSORA = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public votacaoAtiva = true;
    address public donoDoContrato;
    
    string[19] public nomes;

    address[19] public enderecos;

    mapping(string => address) public nomeParaEndereco;
    mapping(address => string) public enderecoParaNome;
    mapping(string => mapping(address => bool)) public jaVotouEm;

    constructor() ERC20("Turing", "TUR") {
        donoDoContrato = msg.sender;

        nomes = [
            "Nome1", "Nome2", "Nome3", "Nome4", "Nome5", "Nome6", "Nome7", "Nome8", "Nome9", "Nome10", 
            "Nome11", "Nome12", "Nome13", "Nome14", "Nome15", "Nome16", "Nome17", "Nome18", "Nome19"
        ];

        enderecos = [
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8), 
            address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC), 
            address(0x90F79bf6EB2c4f870365E785982E1f101E93b906), 
            address(0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65), 
            address(0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc), 
            address(0x976EA74026E726554dB657fA54763abd0C3a0aa9), 
            address(0x14dC79964da2C08b23698B3D3cc7Ca32193d9955), 
            address(0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f), 
            address(0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), 
            address(0xBcd4042DE499D14e55001CcbB24a551F3b954096), 
            address(0x71bE63f3384f5fb98995898A86B02Fb2426c5788), 
            address(0xFABB0ac9d68B0B445fB7357272Ff202C5651694a), 
            address(0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec), 
            address(0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097), 
            address(0xcd3B766CCDd6AE721141F452C550Ca635964ce71), 
            address(0x2546BcD3c84621e976D8185a91A922aE77ECEc30), 
            address(0xbDA5747bFD65F08deb54cb465eB87D40e51B197E), 
            address(0xdD2FD4581271e230360230F9337D5c0430Bf44C0), 
            address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199)
        ];

        for (uint256 i = 0; i < enderecos.length; i++) {
            nomeParaEndereco[nomes[i]] = enderecos[i];
        }

        for (uint256 i = 0; i < enderecos.length; i++) {
            enderecoParaNome[enderecos[i]] = nomes[i];
        }
    }


    modifier professoraOuDono() {
        require(msg.sender == donoDoContrato || msg.sender == PROFESSORA, "Sem premissao");
        _;
    }

    modifier duranteVotacaoAtiva() {
        require(votacaoAtiva, "Votacao nao esta ativa");
        _;
    }

    modifier nomesNaLista(string memory nome) {
        require(nomeParaEndereco[nome] != address(0), "Nome fora da lista");
        require(bytes(enderecoParaNome[msg.sender]).length > 0, "Seu endereco nao esta na lista");
        _;
    }

    modifier nomesNaLista2(string memory nome) {
        require(nomeParaEndereco[nome] != address(0), "Nome fora da lista");
        _;
    }

    event TokenEmitido(string indexed nome, address indexed destinatario, uint256 quantidade);

    function issueToken(string memory nome, uint256 quantidadeSaTurings) public professoraOuDono nomesNaLista2(nome) {
        address destinatario = nomeParaEndereco[nome];
        _mint(destinatario, quantidadeSaTurings);
        emit TokenEmitido(nome, destinatario, quantidadeSaTurings);
    }

    event votoFeito(address indexed nome, address indexed candidato, uint256 quantidadeSaTurings);    

    function vote(string memory nome, uint256 quantidadeSaTurings) public duranteVotacaoAtiva nomesNaLista(nome) {
        address candidato = nomeParaEndereco[nome];
        uint256 quintoDeTuring = 0.2* 10**18;

        require(!jaVotouEm[nome][candidato], "Ja votou nesse candidato");
        require(candidato != msg.sender, "Nao pode votar em si mesmo");
        require(quantidadeSaTurings <= 2 * 10**18, "Limite de SaTurings excedido");

        _mint(candidato, quantidadeSaTurings);
        _mint(msg.sender, quintoDeTuring);

        jaVotouEm[nome][candidato] = true;

        emit votoFeito(msg.sender, candidato, quantidadeSaTurings);
    }

    event alteracaoEstadoDeVoto(bool estado);

    function ligarVotacao() public professoraOuDono {
        votacaoAtiva = true;
        emit alteracaoEstadoDeVoto(true);
    }

    function desligarVotacao() public professoraOuDono {
        votacaoAtiva = false;
        emit alteracaoEstadoDeVoto(false);
    }

    function getNomes(uint256 indice) public view returns(string memory) {

        return nomes[indice];

    } 

}

