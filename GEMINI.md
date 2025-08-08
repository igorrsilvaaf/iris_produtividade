# INSTRUÇÕES OBRIGATÓRIAS PARA O GEMINI

> **IMPORTANTE**: Este documento DEVE ser lido e seguido antes de qualquer modificação no código.

## 🔍 ANÁLISE PRÉVIA OBRIGATÓRIA

### 1. MAPEAMENTO COMPLETO DO PROJETO
**Execute esta análise ANTES de qualquer alteração:**

```
CHECKLIST DE ANÁLISE:
□ Ler completamente o(s) arquivo(s) que serão modificados
□ Identificar arquitetura utilizada (MVC, Clean Architecture, Hexagonal, etc.)
□ Mapear todas as dependências e importações
□ Identificar convenções de nomenclatura em uso
□ Verificar estrutura de pastas e organização
□ Analisar padrões de exportação/importação
```

### 2. CONTEXTO E PADRÕES EXISTENTES
```
VERIFICAÇÕES OBRIGATÓRIAS:
□ Examinar arquivos relacionados na mesma pasta/módulo
□ Localizar interfaces, types, DTOs ou contratos existentes
□ Identificar padrões de tratamento de erro implementados
□ Analisar como funcionalidades similares foram codificadas
□ Verificar padrões de validação e sanitização de dados
□ Identificar bibliotecas e frameworks em uso
```

### 3. CONFIGURAÇÕES DO PROJETO
```
ARQUIVOS PARA CONSULTAR:
□ package.json (dependências e scripts)
□ tsconfig.json ou jsconfig.json (configurações TypeScript/JavaScript)
□ .eslintrc, .prettierrc (regras de formatação)
□ Arquivos de configuração do framework (next.config.js, vite.config.js, etc.)
□ Arquivos de ambiente (.env, .env.example)
```

## 📋 REGRAS DE IMPLEMENTAÇÃO

### CONSISTÊNCIA DE CÓDIGO
- **ZERO COMENTÁRIOS**: Nunca adicione comentários explicativos no código
- **INDENTAÇÃO**: Mantenha EXATAMENTE o mesmo padrão (espaços/tabs)
- **NOMENCLATURA**: Use as MESMAS convenções (camelCase, PascalCase, kebab-case, snake_case)
- **IMPORTAÇÕES**: Respeite ordem e agrupamento existentes
- **ESTRUTURA**: Mantenha a organização de pastas atual

### QUALIDADE E ROBUSTEZ
- Implemente tratamento de erro seguindo padrões existentes
- Valide entrada de dados usando as mesmas bibliotecas/métodos do projeto
- Mantenha consistência com validações já implementadas
- Use os mesmos padrões de logging se existirem
- Reutilize funções utilitárias e componentes existentes

### PERFORMANCE E OTIMIZAÇÃO
- Evite duplicação de código
- Prefira reutilização sobre recriação
- Mantenha o mesmo nível de otimização do código atual
- Use as mesmas técnicas de memoização/cache se aplicável

## 💬 PROTOCOLO DE COMUNICAÇÃO

### LÍNGUA OBRIGATÓRIA
- **SEMPRE português brasileiro**
- Comunicação clara, direta e técnica

### ANTES DE IMPLEMENTAR - OBRIGATÓRIO
**Você DEVE me informar:**
1. Qual arquitetura/padrão foi identificado no projeto
2. Que abordagem específica você vai seguir
3. Se encontrou inconsistências que precisam ser resolvidas
4. Se será necessário criar novos arquivos ou modificar estrutura
5. Quais bibliotecas/frameworks estão sendo utilizados

### APÓS IMPLEMENTAR
**Sempre forneça:**
- Resumo claro do que foi alterado
- Confirmação de qual padrão foi seguido
- Identificação de possíveis melhorias futuras
- Alertas sobre dependências que podem ser necessárias

## ✅ VERIFICAÇÃO FINAL OBRIGATÓRIA

Antes de apresentar qualquer código, confirme:

```
CHECKLIST FINAL:
□ Código segue EXATAMENTE os padrões identificados
□ ZERO comentários foram adicionados
□ Funcionalidade está completa e testável
□ Convenções de nomenclatura foram respeitadas
□ Estilo de código está 100% consistente
□ Não há quebras de padrão existentes
□ Imports estão organizados conforme padrão do projeto
□ Tratamento de erro segue o padrão identificado
```

## 🚫 PROIBIÇÕES ABSOLUTAS

- **NUNCA** altere convenções existentes
- **NUNCA** adicione comentários no código
- **NUNCA** mude estrutura de pastas sem aprovação
- **NUNCA** introduza novas dependências sem discussão
- **NUNCA** quebre padrões de arquitetura existentes
- **NUNCA** ignore configurações de linting/formatação

## 🎯 OBJETIVO FINAL

Cada modificação deve ser **INVISÍVEL** no contexto do projeto - como se tivesse sido escrita pelo desenvolvedor original, seguindo exatamente os mesmos padrões, convenções e estilo.

---

**LEMBRE-SE**: A qualidade do código é medida pela sua consistência com o projeto existente, não por padrões externos.
