// src/repositories/fornecedorRepository.js
import Fornecedor from "../models/Fornecedor.js";
import FornecedorFilterBuilder from "./filters/FornecedorFilterBuilder.js";
import CustomError from "../utils/helpers/CustomError.js";
import messages from "../utils/helpers/messages.js";
import mongoose from "mongoose";

class FornecedorRepository {
  constructor({ model = Fornecedor } = {}) {
    this.model = model;
  }

  async criar(dadosFornecedor) {
    const fornecedor = new this.model(dadosFornecedor);
    return await fornecedor.save();
  }

  // Método para listagem com filtros, paginação e ordenação
  async listar(queryParams) {
    const { page = 1, limite = 10, nome_fornecedor, cnpj, status, cidade, estado, ordenar_por = "nome_fornecedor" } = queryParams;

    const filterBuilder = new FornecedorFilterBuilder()
      .comNome(nome_fornecedor)
      .comCNPJ(cnpj)
      .comStatus(status)
      .comCidade(cidade)
      .comEstado(estado);

    const filtros = filterBuilder.build();

    const options = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limite, 10), 100),
      sort: { [ordenar_por]: 1 },
    };

    return await this.model.paginate(filtros, options);
  }

  // Método dedicado para buscar um fornecedor por ID
  async buscarPorId(id, queryParams = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({ statusCode: 400, customMessage: "ID do fornecedor inválido." });
    }
    
    let query = this.model.findById(id);

    // Suporte para incluir dados relacionados, conforme documentação
    if (queryParams.incluir_produtos === 'true') {
        // query = query.populate('produtos'); // Exemplo: Carrega produtos associados
    }

    const fornecedor = await query.exec();

    if (!fornecedor) {
      throw new CustomError({ statusCode: 404, customMessage: messages.error.resourceNotFound("Fornecedor") });
    }
    return fornecedor;
  }

  // Método para a busca avançada (endpoint /buscar)
  async buscaAvancada(queryParams) {
      const { q, estados, cidades, incluir_inativos = false, page = 1, limite = 10, ordenar_por = "nome_fornecedor" } = queryParams;

      let filtros = {};
      if (String(incluir_inativos).toLowerCase() !== 'true') {
          filtros.status = true;
      }

      if (q) {
          const termoBusca = new RegExp(q, 'i');
          filtros.$or = [
              { nome_fornecedor: termoBusca },
              { email: termoBusca },
              { cnpj: termoBusca }
          ];
      }

      if (estados) {
          filtros['endereco.estado'] = { $in: estados.split(',').map(e => e.trim().toUpperCase()) };
      }
      if (cidades) {
          filtros['endereco.cidade'] = { $in: cidades.split(',').map(c => new RegExp(c.trim(), 'i')) };
      }

      const options = {
          page: parseInt(page, 10),
          limit: Math.min(parseInt(limite, 10), 100),
          sort: { [ordenar_por]: 1 }
      };

      return await this.model.paginate(filtros, options);
  }

  // Método auxiliar para checar unicidade de campos antes de criar/atualizar
  async encontrarPorCamposUnicos(cnpj, email, idExcluido = null) {
      const query = {
          $or: [{ cnpj }, { email }]
      };
      if (idExcluido) {
          query._id = { $ne: idExcluido };
      }
      return this.model.findOne(query);
  }

  async atualizar(id, dadosAtualizados) {
    const fornecedor = await this.model.findByIdAndUpdate(id, dadosAtualizados, { new: true });
    if (!fornecedor) {
      throw new CustomError({ statusCode: 404, customMessage: messages.error.resourceNotFound("Fornecedor") });
    }
    return fornecedor;
  }
  
  // Apenas executa a exclusão física (hard delete)
  async deletar(id) {
    const resultado = await this.model.findByIdAndDelete(id);
    if (!resultado) {
      throw new CustomError({ statusCode: 404, customMessage: messages.error.resourceNotFound("Fornecedor") });
    }
    return resultado;
  }

  // Apenas executa a inativação (soft delete)
  async desativar(id) {
    return await this.model.findByIdAndUpdate(id, { status: false }, { new: true });
  }
}

export default FornecedorRepository;