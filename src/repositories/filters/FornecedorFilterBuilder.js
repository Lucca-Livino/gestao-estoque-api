// src/utils/FornecedorFilterBuilder.js

class FornecedorFilterBuilder {
  constructor() {
    this.filtros = {};
  }

  // Filtro por nome do fornecedor (busca parcial e case-insensitive)
  comNome(nome) {
    if (nome) {
      this.filtros.nome_fornecedor = { $regex: nome, $options: "i" };
    }
    return this;
  }

  // Filtro por CNPJ (busca exata, sem máscara)
  comCNPJ(cnpj) {
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
      this.filtros.cnpj = cnpjLimpo;
    }
    return this;
  }
  
  // Filtro por status (booleano)
  comStatus(status) {
    if (status !== undefined && status !== null) {
      this.filtros.status = String(status).toLowerCase() === 'true';
    }
    return this;
  }

  // Filtro por cidade em qualquer um dos endereços
  comCidade(cidade) {
    if (cidade) {
      this.filtros['endereco.cidade'] = { $regex: cidade, $options: 'i' };
    }
    return this;
  }

  // Filtro por estado em qualquer um dos endereços
  comEstado(estado) {
    if (estado) {
      this.filtros['endereco.estado'] = { $regex: `^${estado}$`, $options: 'i' };
    }
    return this;
  }

  build() {
    return this.filtros;
  }
}

export default FornecedorFilterBuilder;
