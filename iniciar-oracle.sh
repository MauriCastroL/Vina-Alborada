#!/bin/bash

{
    printf '%s\n' 'WHENEVER SQLERROR EXIT FAILURE ROLLBACK' 'WHENEVER OSERROR EXIT FAILURE ROLLBACK' 'SET DEFINE OFF'
    # El usuario recién creado tiene el esquema vacío.
    sed '/^DROP /d' /opt/alborada/script.sql
    printf '\n'
    cat <<'SQL'
SELECT NAME, TYPE, LINE, POSITION, TEXT
FROM USER_ERRORS
WHERE ATTRIBUTE = 'ERROR'
ORDER BY NAME, TYPE, SEQUENCE;

DECLARE
    V_INVALIDOS NUMBER;
    V_ADMIN NUMBER;
BEGIN
    SELECT COUNT(*) INTO V_INVALIDOS FROM USER_OBJECTS WHERE STATUS = 'INVALID';
    IF V_INVALIDOS > 0 THEN
        RAISE_APPLICATION_ERROR(-20000, 'Hay objetos inválidos. Revise los errores de compilación.');
    END IF;
    SELECT COUNT(*) INTO V_ADMIN FROM CEMJ_USUARIO WHERE CORREO = 'ADMIN@ALBORADA.CL';
    IF V_ADMIN <> 1 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Falta la cuenta de administración de la demo.');
    END IF;
END;
/
EXIT SUCCESS
SQL
} | sqlplus -L -S "${APP_USER}/\"${APP_USER_PASSWORD}\"@//localhost:1521/FREEPDB1" &&
    touch /opt/oracle/oradata/.alborada-inicializada
