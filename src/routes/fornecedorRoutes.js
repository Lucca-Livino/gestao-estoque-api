import express from "express";
import { asyncWrapper } from "../utils/helpers/index.js";
import FornecedorController from "../controllers/FornecedorController.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";

const router = express.Router();
const fornecedorController = new FornecedorController();

router
  .get(
    "/",
    LogMiddleware.log("CONSULTA_FORNECEDORES"),
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  
  .get(
    "/:id",
    LogMiddleware.log("CONSULTA_FORNECEDOR"),
    asyncWrapper(fornecedorController.buscarPorId.bind(fornecedorController))
  )
  
  .post(
    "/",
    LogMiddleware.log("CADASTRO_FORNECEDOR"),
    asyncWrapper(fornecedorController.criar.bind(fornecedorController))
  )
  
  .put(
    "/:id",
    LogMiddleware.log("ATUALIZACAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.atualizarCompleto.bind(fornecedorController))
  )
  
  .delete(
    "/:id",
    LogMiddleware.log("EXCLUSAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.deletar.bind(fornecedorController))
  )
  
  .patch(
    "/desativar/:id",
    LogMiddleware.log("DESATIVACAO_FORNECEDOR"),
    asyncWrapper(
      fornecedorController.atualizarParcial.bind(fornecedorController)
    )
  );

export default router;
