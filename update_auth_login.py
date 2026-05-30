import re

filepaths = ["translations.js"]

for filepath in filepaths:
    with open(filepath, 'r') as f:
        content = f.read()

    # Update NL
    content = content.replace('"auth_login_btn": "INLOGGEN"', '"auth_login_btn": "Inloggen"')
    # Update FR
    content = content.replace('"auth_login_btn": "CONNEXION"', '"auth_login_btn": "Connexion"')
    # EN is already 'LOGIN' or 'Login'? trace says 1277:    "auth_login_btn": "LOGIN",
    content = content.replace('"auth_login_btn": "LOGIN"', '"auth_login_btn": "Login"')

    with open(filepath, 'w') as f:
        f.write(content)
