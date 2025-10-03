// src/controllers/FornecedorController.js

import FornecedorService from "../services/fornecedorService.js";
import CommonResponse from "../utils/helpers/CommonResponse.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";
import { FornecedorIdSchema } from "../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js";

class FornecedorController {
  constructor() {
    this.service = new FornecedorService();
  }

  // POST /fornecedores
  async criar(req, res) {
    const data = await this.service.criar(req.body);
    return CommonResponse.created(res, data, HttpStatusCodes.CREATED.code, "Fornecedor cadastrado com sucesso.");
  }

  // GET /fornecedores
  async listar(req, res) {
    // Passa apenas os query params para o serviço, desacoplando-o do Express
    const data = await this.service.listar(req.query);
    return CommonResponse.success(res, data, HttpStatusCodes.OK.code, "Fornecedores listados com sucesso.");
  }

  // GET /fornecedores/buscar - Novo endpoint para busca avançada
  async buscaAvancada(req, res) {
    const data = await this.service.buscaAvancada(req.query);
    return CommonResponse.success(res, data, HttpStatusCodes.OK.code, "Busca de fornecedores realizada com sucesso.");
  }

  // GET /fornecedores/:id
  async buscarPorId(req, res) {
    const { id } = req.params;
    FornecedorIdSchema.parse(id); // Validação Zod
    
    // Passa o ID e parâmetros adicionais (como incluir_produtos) para o serviço
    const data = await this.service.buscarPorId(id, req.query);
    return CommonResponse.success(res, data, HttpStatusCodes.OK.code, "Fornecedor encontrado com sucesso.");
  }

  // PUT /fornecedores/:id - Atualização completa do recurso
  async atualizarCompleto(req, res) {
    const { id } = req.params;
    FornecedorIdSchema.parse(id);
    const data = await this.service.atualizar(id, req.body);
    return CommonResponse.success(res, data, HttpStatusCodes.OK.code, "Fornecedor atualizado com sucesso.");
  }

  // PATCH /fornecedores/:id - Atualização parcial do recurso (incluindo ativar/desativar)
  async atualizarParcial(req, res) {
    const { id } = req.params;
    FornecedorIdSchema.parse(id);
    const data = await this.service.atualizar(id, req.body);
    return CommonResponse.success(res, data, HttpStatusCodes.OK.code, "Fornecedor atualizado com sucesso.");
  }

  // DELETE /fornecedores/:id
  async deletar(req, res) {
    const { id } = req.params;
    FornecedorIdSchema.parse(id);

    // O serviço agora retorna uma mensagem específica sobre a ação tomada
    const resultado = await this.service.deletar(id);
    
    return CommonResponse.success(
      res,
      resultado.data,
      HttpStatusCodes.OK.code,
      resultado.message // A mensagem vem diretamente da lógica de negócio
    );
  }
}

export default FornecedorController;
