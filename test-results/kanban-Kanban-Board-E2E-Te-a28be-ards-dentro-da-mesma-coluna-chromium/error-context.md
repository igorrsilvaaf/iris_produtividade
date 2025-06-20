# Page snapshot

```yaml
- banner:
  - link "Íris":
    - /url: /
  - button "Alternar tema":
    - img
    - img
    - text: Alternar tema
  - link "Cadastrar":
    - /url: /register
    - button "Cadastrar"
- main:
  - heading "Bem-vindo de volta" [level=1]
  - paragraph: Entre na sua conta para continuar
  - text: Email
  - textbox "Email": usuario.teste@exemplo.com
  - text: Senha
  - textbox "••••••••": senha123
  - button "Mostrar senha":
    - img
    - text: Mostrar senha
  - checkbox "Lembrar de mim"
  - text: Lembrar de mim
  - link "Esqueceu a senha?":
    - /url: /forgot-password
  - button "Entrar"
  - paragraph:
    - text: Não tem uma conta?
    - link "Cadastrar":
      - /url: /register
- region "Notifications (F8)":
  - list
- alert
```