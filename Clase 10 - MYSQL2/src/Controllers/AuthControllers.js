import ENVIRONMENT from "../Config/environment.config.js";
import mailer_transporter from "../Config/Mailer.config.js";
import userRepository from "../Repositories/UserRepository.js"
import { generateHash, compareHash } from "../Utils/bcrypt.js"
import ServerError from "../Utils/Error.Utils.js"


/* 
Para enviar en una request HTTP info a una API usamos el body

Las consultas (request) tipo GET NO TIENEN body
El body puede ser de distintos tipos de dato:
    Hoy vamos a usar JSON, para poder usar JSON nuestra API debe estar preparada para recibir ese tipo de informacion
*/

export async function register(request, response) {
    const { username, email, password } = request.body;
    if (
        typeof username !== "string" || //typeof te dice qué tipo de dato recibió JavaScript.
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        throw new ServerError(
            "Username, email and password are required",
            400
        );
    }

    const normalizedUsername = username.trim(); //.trim() funciona sobre string y elimina espacios al inicio y al final.
    const normalizedEmail = email.trim().toLowerCase(); //Convierte todo el texto a minúsculas.
    if (!normalizedUsername || !normalizedEmail || !password.trim()) {
        throw new ServerError(
            "Username, email and password are required",
            400
        );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const existingUser = await userRepository.getByEmail(
        normalizedEmail
    );
    if (existingUser) {
        throw new ServerError(
            "Email is already used",
            400
        );
    }

    const hashedPassword = await generateHash(password, 12);
    try {
        await userRepository.create(
            normalizedUsername,
            normalizedEmail,
            hashedPassword
        );
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { //error.code === 'ER_DUP_ENTRY' detecta un error específico de MySQL: intentó guardar un valor duplicado en un campo que tiene UNIQUE.
            throw new ServerError("Email is already used", 400);
        }
        throw error;
    }

    const emailVerificationToken = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: "1d"
        }
    )
    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Verify your account",
            html: `
                <body>
                    <h1>Welcome to our platform</h1>
                    <p>We need you to verify your email</p>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify_mail/${emailVerificationToken}'>Click here to verify your email</a>
                </body>
            `
        }
    )

    return response.status(201).send({
        ok: true,
        message: "User registered successfully",
    });
}

export async function login(request, response) {
    const { email, password } = request.body;
    if (
        !email || !password || typeof email !== "string" || typeof password !== "string" //typeof te dice qué tipo de dato recibió.
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }

    const normalizedEmail = email.trim().toLowerCase(); // .trim() funciona sobre string y elimina espacios al inicio y al final. .toLowerCase() Convierte todo el texto a minúsculas.
    if (!normalizedEmail || !password.trim()) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { //Verifica que el email tenga formato de email.
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const user = await userRepository.getByEmail(normalizedEmail); //Busca por email al usuario y verificar que este exista.
    if (!user) {
        throw new ServerError(
            "User not found",
            404
        );
    }

    const isPasswordValid = await compareHash(password, user.password); //Compara el hash guardado en DB contra la contraseña que nos envió por body el cliente.
    if (!isPasswordValid) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    const authToken = jwt.sign(
        { //Acá va la info que querpes guardar como credencial 
            id: user._id,
            name: user.name,
            email: user.email
        },
        ENVIRONMENT._SECRET_KEY
    )

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
    });
}


export async function verifyEmail(request, response) {
    const { verifyEmailToken } = request.params
    const { email } = jwt.verify(verifyEmailToken, ENVIRONMENT.JWT_SECRET_KEY)

    const foundUser = await userRepository.getByEmail(email)

    if (!foundUser) {
        throw new ServerError('User not found', 404)
    }

    if(!foundUser.active){
        throw new ServerError('The account was deactivated. Contact the client support if you think this is a mistake.', 400)
    }

    if(foundUser.verified_email){
        throw new ServerError('You have already verified your account', 400)
    }

    userRepository.updateById(
        foundUser._id,
        {verifyEmail: true}
    )

    return response.status(200).send( 
        {
            ok: true,
            message: 'User verified successfully.'
        }
    )
}



/* Cuando un usurio inicia sesión, debemos darle una credencial fimada que nos permita indicar quién ese usuario. Más adelante, ese usuario devolverá esa credencial para que el server pueda confiar en él.

Para emitir esa credencial, usamos JWT (JsonWebTokens).
Los JWT son objetos de Js pasados a string mediande un algoritmo que se llama HS256. */