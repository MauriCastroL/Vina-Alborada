-- 1. SYS_REFCURSOR

CREATE OR REPLACE PROCEDURE CEMJ_PA_GES_VENTA_DETALLE(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ID_VENTA CEMJ_DETALLE_VENTA.ID_VENTA%TYPE
)
IS
BEGIN
    OPEN P_CURSOR FOR
        SELECT DV.ID_VENTA,
               P.CODIGO,
               P.NOMBRE,
               DV.CANTIDAD,
               DV.PRECIO_UNITARIO,
               DV.CANTIDAD * DV.PRECIO_UNITARIO AS SUBTOTAL,
               DV.ID_PRODUCTO
        FROM CEMJ_DETALLE_VENTA DV
        JOIN CEMJ_PRODUCTO P ON P.ID_PRODUCTO = DV.ID_PRODUCTO
        WHERE DV.ID_VENTA = P_ID_VENTA
        ORDER BY P.CODIGO;
END;
/

-- PREGUNTA:
-- Para devolver varias filas desde PL/SQL al backend estamos usando
-- SYS_REFCURSOR con OPEN P_CURSOR FOR. ¿Podemos utilizarlo en el proyecto
-- aunque no lo hayamos visto explicitamente en clases?


-- 2. DBMS_SESSION.SET_IDENTIFIER / CLEAR_IDENTIFIER
CREATE OR REPLACE PROCEDURE CEMJ_PA_SESION_USUARIO(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE
)
IS
BEGIN
    IF P_ID_USUARIO IS NULL THEN
        DBMS_SESSION.CLEAR_IDENTIFIER;
    ELSE
        DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(P_ID_USUARIO));
    END IF;
END;
/

-- PREGUNTA:
-- Aqui usamos DBMS_SESSION.SET_IDENTIFIER para asociar el ID del usuario
-- de la aplicacion a la sesion de Oracle y CLEAR_IDENTIFIER para limpiarlo.
-- ¿Podemos utilizar esto en el proyecto?


-- 3. SYS_CONTEXT
CREATE OR REPLACE TRIGGER CEMJ_TRIGGER_AUDITORIA_INSERT
BEFORE INSERT
ON CEMJ_AUDITORIA
FOR EACH ROW
BEGIN
    IF :NEW.FECHA IS NULL THEN
        :NEW.FECHA := SYSDATE;
    END IF;

    IF :NEW.USUARIO_BD IS NULL THEN
        :NEW.USUARIO_BD := USER;
    END IF;

    IF :NEW.USUARIO_APP IS NULL THEN
        :NEW.USUARIO_APP := SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER');
    END IF;

    IF :NEW.EQUIPO IS NULL THEN
        :NEW.EQUIPO := SYS_CONTEXT('USERENV', 'HOST');
    END IF;
END;
/

-- PREGUNTA:
-- Con SYS_CONTEXT podemos recuperar el CLIENT_IDENTIFIER y el HOST
-- de la sesion y guardarlos en la auditoria. ¿Podemos utilizar SYS_CONTEXT
-- de esta forma en el proyecto?


-- 4. PRAGMA AUTONOMOUS_TRANSACTION
CREATE OR REPLACE PROCEDURE CEMJ_PA_LOGIN_REGISTRAR(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE, P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_EXITOSO NUMBER, P_MOTIVO CEMJ_AUDITORIA.DETALLE%TYPE
)
IS
    PRAGMA AUTONOMOUS_TRANSACTION;
    V_OPERACION CEMJ_AUDITORIA.OPERACION%TYPE;
BEGIN
    IF P_EXITOSO = 1 THEN
        V_OPERACION := 'LOGIN_OK';
    ELSE
        V_OPERACION := 'LOGIN_FALLIDO';
    END IF;

    CEMJ_PA_AUDITORIA_REGISTRAR(
        'LOGIN', V_OPERACION, NVL(P_CORREO, '(VACIO)'),
        P_MOTIVO, TO_CHAR(P_ID_USUARIO)
    );

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- PREGUNTA:
-- Aca usamos PRAGMA AUTONOMOUS_TRANSACTION para que un intento fallido
-- de login quede registrado aunque la operacion principal termine en ROLLBACK.
-- ¿Podemos utilizarlo para este caso?


-- 5. SQLERRM

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, CONCAT('ERROR AL CREAR USUARIO: ', SQLERRM));

-- PREGUNTA:
-- Y tambien usamos SQLERRM dentro de WHEN OTHERS para obtener el mensaje
-- original de Oracle y agregarlo al RAISE_APPLICATION_ERROR.
-- ¿Podemos utilizar SQLERRM de esta forma? o dejamos un mensaje general creado por nosotros


-- 6. HASHING DE CONTRASENAS

CREATE OR REPLACE FUNCTION CEMJ_FN_HASH_CLAVE(
    P_CLAVE VARCHAR2
)
RETURN CEMJ_USUARIO.PASSWORD_HASH%TYPE
IS
    V_HASH CEMJ_USUARIO.PASSWORD_HASH%TYPE;
BEGIN
    SELECT STANDARD_HASH(P_CLAVE, 'SHA256') INTO V_HASH
    FROM DUAL;

    RETURN V_HASH;
END;
/

-- PREGUNTA:
-- Profesor, ¿prefiere que el hashing y la validacion de contrasenas se hagan
-- dentro de Oracle mediante una funcion PL/SQL como esta, o en el backend?
-- Si se hace en Oracle, ¿podemos utilizar STANDARD_HASH con SHA-256?


-- 7. REGEXP_LIKE - VALIDACION DEL CORREO
CREATE OR REPLACE FUNCTION CEMJ_FN_FORMATO_CORREO(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE
)
RETURN NUMBER
IS
BEGIN
    IF P_CORREO IS NULL THEN
        RETURN 0;
    END IF;

    IF REGEXP_LIKE(
        P_CORREO,
        '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ) THEN
        RETURN 1;
    END IF;

    RETURN 0;
END;
/

-- PREGUNTA:
-- Profesor, usamos REGEXP_LIKE con una expresion regular para validar el
-- formato del correo. ¿Podemos utilizar REGEXP_LIKE aunque no lo hayamos
-- visto en clases?
