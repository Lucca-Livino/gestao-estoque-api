// src/services/fornecedorService.js
import mongoose from "mongoose";
import FornecedorRepository from "../repositories/fornecedorRepository.js";
import { CustomError, HttpStatusCodes } from "../utils/helpers/index.js";
import messages from "../utils/helpers/messages.js";

class FornecedorService {
  constructor() {
    this.repository = new FornecedorRepository();
  }

  // Valida unicidade de CNPJ/Email antes de chamar o repositório
  async criar(dados) {
    const { cnpj, email } = dados;
    const fornecedorExistente = await this.repository.encontrarPorCamposUnicos(cnpj, email);

    if (fornecedorExistente) {
      const campo = fornecedorExistente.cnpj === cnpj ? 'CNPJ' : 'Email';
      throw new CustomError({
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: messages.error.duplicateResource(campo),
      });
    }

    return await this.repository.criar(dados);
  }

  async listar(queryParams) {
    return await this.repository.listar(queryParams);
  }
  
  async buscarPorId(id, queryParams) {
    return await this.repository.buscarPorId(id, queryParams);
  }

  async buscaAvancada(queryParams) {
      return await this.repository.buscaAvancada(queryParams);
  }

  // Valida e orquestra a atualização
  async atualizar(id, dados) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError({ statusCode: 400, customMessage: "ID do fornecedor inválido." });
    }
    
    const fornecedorAtual = await this.repository.buscarPorId(id);

    // Se o email foi alterado, verifica se o novo email já está em uso
    if (dados.email && dados.email !== fornecedorAtual.email) {
      const fornecedorComEmail = await this.repository.encontrarPorCamposUnicos(null, dados.email, id);
      if (fornecedorComEmail) {
        throw new CustomError({
          statusCode: HttpStatusCodes.CONFLICT.code,
          customMessage: messages.error.duplicateResource('Email'),
        });
      }
    }
    
    return await this.repository.atualizar(id, dados);
  }

  /**
   * REGRA DE NEGÓCIO PRINCIPAL: Deletar ou Desativar.
   * Verifica se existem vínculos. Se sim, desativa (soft delete).
   * Se não, remove permanentemente (hard delete).
   * Retorna um objeto com uma mensagem clara sobre a ação realizada.
   */
  async deletar(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({ statusCode: 400, customMessage: "ID do fornecedor inválido." });
    }

    // LÓGICA DE VERIFICAÇÃO DE VÍNCULOS
    const produtosVinculados = 0; // Mock: Mude para 1 ou mais para testar a desativação

    if (produtosVinculados > 0) {
      // Se há vínculos, apenas desativa o fornecedor
      const fornecedorDesativado = await this.repository.desativar(id);
      return {
        message: "Fornecedor possui vínculos e foi desativado em vez de excluído.",
        data: fornecedorDesativado
      };
    } else {
      // Se não há vínculos, remove permanentemente
      await this.repository.deletar(id);
      return {
        message: "Fornecedor excluído com sucesso.",
        data: null
      };
    }
  }
}

export default FornecedorService;