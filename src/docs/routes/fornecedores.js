import commonSchemas from "../schemas/common.js";

const fornecedoresRoutes = {
    "/fornecedores": {
        get: {
            tags: ["Fornecedores"],
            summary: "Lista todos os fornecedores",
            description: `
            Lista todos os fornecedores cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática com mongoose-paginate-v2
            - Filtros por nome, CNPJ, email, status
            - Busca textual parcial (case-insensitive)
            - Ordenação por nome, data de cadastro
            - Filtros por estado/cidade
            - Controle de acesso por perfil
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome_fornecedor",
                    in: "query",
                    description: "Filtrar por nome do fornecedor (busca parcial)",
                    schema: { type: "string" }
                },
                {
                    name: "cnpj",
                    in: "query",
                    description: "Filtrar por CNPJ (busca parcial)",
                    schema: { type: "string" }
                },
                {
                    name: "email",
                    in: "query",
                    description: "Filtrar por email",
                    schema: { type: "string" }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Filtrar por status ativo",
                    schema: { type: "boolean" }
                },
                {
                    name: "cidade",
                    in: "query",
                    description: "Filtrar por cidade",
                    schema: { type: "string" }
                },
                {
                    name: "estado",
                    in: "query",
                    description: "Filtrar por estado (UF)",
                    schema: { type: "string" }
                },
                {
                    name: "ordenar_por",
                    in: "query",
                    description: "Campo de ordenação",
                    schema: { 
                        type: "string", 
                        enum: ["nome_fornecedor", "data_cadastro", "email"],
                        default: "nome_fornecedor"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedores listados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        post: {
            tags: ["Fornecedores"],
            summary: "Cadastrar novo fornecedor",
            description: `
            Cadastra um novo fornecedor no sistema com validação completa.
            
            **Validações:**
            - Nome obrigatório (mínimo 3 caracteres)
            - CNPJ único e válido (formato XX.XXX.XXX/XXXX-XX)
            - Email válido e único
            - Telefone obrigatório
            - Pelo menos um endereço obrigatório
            - Validação de CEP se fornecido
            
            **Regras de Negócio:**
            - CNPJ deve ser único no sistema
            - Email deve ser único no sistema
            - Status padrão é ativo (true)
            - Pode ter múltiplos endereços
            - Data de cadastro é automática
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorCreateRequest"
                        },
                        examples: {
                            "fornecedor_completo": {
                                summary: "Fornecedor com endereço completo",
                                value: {
                                    nome_fornecedor: "Auto Peças Sul Ltda",
                                    cnpj: "12.345.678/0001-90",
                                    telefone: "(11) 99999-9999",
                                    email: "contato@autopecassul.com",
                                    endereco: [
                                        {
                                            logradouro: "Rua das Peças, 123",
                                            bairro: "Centro",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01234-567"
                                        }
                                    ]
                                }
                            },
                            "fornecedor_multiplos_enderecos": {
                                summary: "Fornecedor com múltiplos endereços",
                                value: {
                                    nome_fornecedor: "Distribuidora Nacional de Peças",
                                    cnpj: "23.456.789/0001-01",
                                    telefone: "(11) 88888-8888",
                                    email: "vendas@distribuidoranacional.com",
                                    endereco: [
                                        {
                                            logradouro: "Av. Paulista, 1000",
                                            bairro: "Bela Vista",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01310-100"
                                        },
                                        {
                                            logradouro: "Rua das Flores, 500",
                                            bairro: "Centro",
                                            cidade: "Rio de Janeiro",
                                            estado: "RJ",
                                            cep: "20040-020"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Fornecedor cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "CNPJ ou email já cadastrados",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/ErrorResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            details: {
                                                type: "object",
                                                properties: {
                                                    campo_duplicado: {
                                                        type: "string",
                                                        enum: ["cnpj", "email"],
                                                        example: "cnpj"
                                                    },
                                                    valor_duplicado: {
                                                        type: "string",
                                                        example: "12.345.678/0001-90"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/fornecedores/{id}": {
        get: {
            tags: ["Fornecedores"],
            summary: "Buscar fornecedor por ID",
            description: `
            Busca um fornecedor específico pelo seu ID único.
            
            **Retorna:**
            - Dados completos do fornecedor
            - Todos os endereços cadastrados
            - Status atual e datas de auditoria
            - Estatísticas de produtos fornecidos (se aplicável)
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                },
                {
                    name: "incluir_produtos",
                    in: "query",
                    description: "Incluir lista de produtos fornecidos",
                    schema: {
                        type: "boolean",
                        default: false,
                        example: true
                    }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/FornecedorResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                properties: {
                                                    produtos_fornecidos: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                produto_id: {
                                                                    type: "string",
                                                                    example: "60d5ecb54b24a12a5c8e4f1a"
                                                                },
                                                                nome_produto: {
                                                                    type: "string",
                                                                    example: "Pastilha de Freio Dianteira"
                                                                },
                                                                codigo_produto: {
                                                                    type: "string",
                                                                    example: "PF001"
                                                                },
                                                                categoria: {
                                                                    type: "string",
                                                                    example: "Freios"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    estatisticas: {
                                                        type: "object",
                                                        properties: {
                                                            total_produtos: {
                                                                type: "integer",
                                                                example: 25
                                                            },
                                                            valor_total_estoque: {
                                                                type: "number",
                                                                example: 15750.50
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        put: {
            tags: ["Fornecedores"],
            summary: "Atualizar fornecedor completo",
            description: `
            Atualiza todos os dados de um fornecedor existente.
            
            **Validações:**
            - Fornecedor deve existir
            - CNPJ único (exceto o próprio fornecedor)
            - Email único (exceto o próprio fornecedor)
            - Pelo menos um endereço obrigatório
            - Campos obrigatórios não podem ser removidos
            
            **Importante:**
            - CNPJ não pode ser alterado após cadastro
            - Atualização substitui todos os endereços
            - Para adicionar endereços, use PATCH
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorUpdateRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Email já existe em outro fornecedor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        patch: {
            tags: ["Fornecedores"],
            summary: "Atualizar fornecedor parcialmente",
            description: `
            Atualiza campos específicos de um fornecedor existente.
            
            **Campos Atualizáveis:**
            - nome_fornecedor: Nome do fornecedor
            - telefone: Telefone de contato
            - email: Email (deve ser único)
            - status: Status ativo/inativo
            - endereco: Adicionar/remover endereços específicos
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Preservação dos campos não informados
            - Validação apenas dos campos enviados
            - Ideal para alterações pontuais
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorUpdateRequest"
                        },
                        examples: {
                            "atualizar_contato": {
                                summary: "Atualizar apenas contato",
                                value: {
                                    telefone: "(11) 77777-7777",
                                    email: "novo.contato@autopecassul.com"
                                }
                            },
                            "desativar_fornecedor": {
                                summary: "Desativar fornecedor",
                                value: {
                                    status: false
                                }
                            },
                            "adicionar_endereco": {
                                summary: "Adicionar novo endereço",
                                value: {
                                    endereco: [
                                        {
                                            logradouro: "Rua Nova, 789",
                                            bairro: "Jardins",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01234-789"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        delete: {
            tags: ["Fornecedores"],
            summary: "Excluir fornecedor",
            description: `
            Remove um fornecedor do sistema.
            
            **Validações:**
            - Fornecedor deve existir
            - Verifica se não há produtos associados
            - Fornecedor com produtos ativos não pode ser excluído
            
            **Regras de Negócio:**
        - **Se o fornecedor não possuir vínculos** (como produtos ou pedidos ativos), ele será **removido permanentemente** do banco de dados (hard delete).
        - **Se o fornecedor possuir vínculos**, ele será **inativado** (seu status será alterado para \`false\`) em vez de excluído. Isso preserva o histórico e a integridade referencial dos dados.
        
        A resposta da API indicará qual ação foi realizada.
        `, //
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                description: "ID único do fornecedor",
                schema: { type: "string" }
            }
        ],
        responses: {
            200: {
                description: "Ação de exclusão/inativação concluída com sucesso.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                message: {
                                    type: "string",
                                    description: "Mensagem descrevendo a ação realizada."
                                },
                                data: {
                                    type: "object",
                                    nullable: true
                                }
                            }
                        },
                        examples: {
                            "exclusao_sucesso": {
                                summary: "Fornecedor Excluído",
                                value: {
                                    success: true,
                                    message: "Fornecedor excluído com sucesso.",
                                    data: null
                                }
                            },
                            "inativacao_sucesso": {
                                summary: "Fornecedor Inativado",
                                value: {
                                    success: true,
                                    message: "Fornecedor possui vínculos e foi desativado em vez de excluído.",
                                    data: {
                                        _id: "60d5ecb54b24a12a5c8e4f1b",
                                        nome_fornecedor: "Auto Peças Sul Ltda",
                                        status: false,
                                        // ...outros campos
                                    }
                                }
                            }
                        }
                    }
                }
            },
            404: {
                description: "Fornecedor não encontrado",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            },
            ...commonSchemas.CommonResponses
        }
    }
},
"/fornecedores/buscar": {
    get: {
        tags: ["Fornecedores"],
        summary: "Busca avançada de fornecedores",
        description: "Busca fornecedores com múltiplos critérios e filtros avançados, como busca textual em vários campos e filtros por múltiplos estados ou cidades.", //
        security: [{ bearerAuth: [] }],
        parameters: [
            // ... Parâmetros de busca avançada ...
        ],
        responses: { /* ... */ }
    }
}
// O endpoint /validar-cnpj permaneceria como está na documentação original,
// pois sua definição já é clara.
};

export default fornecedoresRoutes;
