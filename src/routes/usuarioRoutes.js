// src/routes/usuarioRoutes.js

import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';


const router = express.Router();
const usuarioController = new UsuarioController();

router
    // Rotas gerais
    .get(
        "/",
        LogMiddleware.log('CONSULTA_USUARIOS'),
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )
    .post(
        "/",
        LogMiddleware.log('CADASTRO_USUARIO'),
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )

router
    // Rotas específicas
    .get(
        "/busca/:matricula",
        LogMiddleware.log('BUSCA_USUARIO_MATRICULA'),
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )

    // Desativar / Reativar usuário por matrícula
    .patch(
        "/desativar/:matricula",
        LogMiddleware.log('DESATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.desativarUsuario.bind(usuarioController))
    )
    .patch(
        "/reativar/:matricula",
        LogMiddleware.log('REATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.reativarUsuario.bind(usuarioController))
    )

    // update foto de perfil
    .patch(
        "/:matricula/foto-perfil",
        authMiddleware, // Protege a rota
        upload.single('fotoPerfil'), // Processa o arquivo do campo 'fotoPerfil'
        LogMiddleware.log('ATUALIZACAO_FOTO_PERFIL'),
        asyncWrapper(usuarioController.atualizarFotoPerfil.bind(usuarioController))
    )

    // Atualização e exclusão de usuário
    .patch(
        "/:matricula",
        LogMiddleware.log('ATUALIZACAO_USUARIO'),
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )
    .delete(
        "/:matricula",
        LogMiddleware.log('EXCLUSAO_USUARIO'),
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    )

    // --- Gerenciamento de Grupos de Usuários ---
    .post(
        "/grupos/adicionar",
        authMiddleware,
        LogMiddleware.log('ADICAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.adicionarUsuarioAoGrupo.bind(usuarioController))
    )
    .post(
        "/grupos/remover",
        authMiddleware,
        LogMiddleware.log('REMOCAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.removerUsuarioDoGrupo.bind(usuarioController))
    )

    // --- Gerenciamento de Permissões Individuais ---
    .post(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('ADICAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.adicionarPermissaoAoUsuario.bind(usuarioController))
    )
    .delete(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('REMOCAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.removerPermissaoDoUsuario.bind(usuarioController))
    )

    // --- Consulta de Permissões ---
    .get(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('CONSULTA_PERMISSOES_USUARIO'),
        asyncWrapper(usuarioController.obterPermissoesUsuario.bind(usuarioController))
    );

export default router;
