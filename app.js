const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const sprite = document.querySelector('#sprite');
        const spritebricks = document.querySelector('#spritebricks');
        const lifeSprite = document.querySelector('#lifeSprite');

        canvas.width = 448;
        canvas.height = 400;
        ctx.imageSmoothingEnabled = true;
        let counter = 0;

        /*Variables ball*/
        const ballRadius = 3;
        //Posicion pelota
        let x = canvas.width / 2;
        let y = canvas.height - 30;
        //Velocidad de pelota
        let dirX = 1; //abajo
        let dirY = -1; //hacia arriba
        let ballLaunched = false;

        //Variables de la pala
        const paddleH = 16;
        const paddleW = 64;
        //Posicion paleta
        let paddleX = (canvas.width - paddleW) / 2; //ancho de canva menos lo que ocupa la paleta
        let paddleY = canvas.height - paddleH - 10;
        let rightPressed = false;
        let leftPressed = false;
        //Variables de ladrillos
        const brickRowCount = 6;
        const brickColumnCount = 13;
        const brickW = 30;
        const brickH = 14;
        const brickPadding = 0;
        const brickOffsetTop = 80;
        const brickOffsetLeft = 28;
        const bricks = [];
        const brickStatus = {
            ACT: 1,
            DEST: 0
        };

        // Vidas del jugador
        let lives = 3;
        let gameActive = true; // Indica si el juego está activo

        for (let col = 0; col < brickColumnCount; col++) {
            bricks[col] = [];
            for (row = 0; row < brickRowCount; row++) {
                const brickX = col * (brickW + brickPadding) + brickOffsetLeft;
                const brickY = row * (brickH + brickPadding) + brickOffsetTop;
                const random = Math.floor(Math.random() * 7);
                bricks[col][row] = {
                    x: brickX,
                    y: brickY,
                    status: brickStatus.ACT,
                    color: random
                };
            }
        }

        function drawBall() {
            //llamo a contexto
            ctx.beginPath(); //Empiezo a dibujar
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2); //dibujo un arco en las coordenadas x e y. Digo el radio y el ángulo
            ctx.fillStyle = `#fff`;
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle() {
            //forma más rápida de dibujar              
            ctx.drawImage(sprite, //imagen
                96, //clip donde empieza a recortar en x
                400, //clip donde empieza a recortar en y
                paddleW, //tamaño recorte x
                paddleH, //tamaño recorte y
                paddleX, //posicion x del paddle
                paddleY, //posicion y del paddle
                paddleW, //ancho dibujo
                paddleH //alto dibujo
            );
        }

        function drawBricks() {
            for (let col = 0; col < brickColumnCount; col++) {
                for (let row = 0; row < brickRowCount; row++) {
                    const currentBrick = bricks[col][row];
                    if (currentBrick.status === brickStatus.ACT) {
                        const clipX = currentBrick.color * 64;
                        ctx.drawImage(
                            spritebricks,
                            clipX,
                            0,
                            64,
                            32,
                            currentBrick.x,
                            currentBrick.y,
                            brickW,
                            brickH
                        );
                    }
                }
            }
        }

    function drawLives() {
    const originalLifeWidth = 64; // Ancho original del sprite de vida
    const originalLifeHeight = 64; // Altura original del sprite de vida
    const lifeWidth = 32; // Nuevo ancho del sprite de vida
    const lifeHeight = 32; // Nueva altura del sprite de vida
    const lifeSpacing = 5; // Espacio entre los sprites de vida
    const initialX = 10; // Posición inicial X de los sprites de vida
    const y = 10; // Posición Y de los sprites de vida

    for (let i = 0; i < lives; i++) {
        ctx.drawImage(
            lifeSprite,
            0,
            0,
            originalLifeWidth,
            originalLifeHeight,
            initialX + (lifeWidth + lifeSpacing) * i,
            y,
            lifeWidth,
            lifeHeight
        );
    }
}


        function collisionDetection() {
            for (let col = 0; col < brickColumnCount; col++) {
                for (let row = 0; row < brickRowCount; row++) {
                    const currentBrick = bricks[col][row];
                    if (currentBrick.status === brickStatus.ACT) {
                        const brickX = currentBrick.x;
                        const brickY = currentBrick.y;
                        // Verificar si la bola está dentro de los límites del ladrillo
                        if (x + ballRadius > brickX && x - ballRadius < brickX + brickW && y + ballRadius > brickY && y - ballRadius < brickY + brickH) {
                            // Determinar desde qué dirección ha golpeado la bola el ladrillo
                            const fromLeft = x - ballRadius < brickX;
                            const fromRight = x + ballRadius > brickX + brickW;
                            const fromTop = y - ballRadius < brickY;
                            const fromBottom = y + ballRadius > brickY + brickH;

                            // Si la bola golpea el ladrillo desde arriba o abajo, cambiar la dirección Y
                            if (fromTop || fromBottom) {
                                dirY = -dirY;
                            }
                            // Si la bola golpea el ladrillo desde la izquierda o la derecha, cambiar la dirección X
                            if (fromLeft || fromRight) {
                                dirX = -dirX;
                            }
                            // Marcar el ladrillo como destruido
                            currentBrick.status = brickStatus.DEST;
                            return; // Detener la función después de encontrar una colisión
                        }
                    }
                }
            }
        }

        function ballMovement() {
            if (!ballLaunched) {
                // Mantener la bola junto al paddle hasta que se lance
                x = paddleX + paddleW / 2;
                y = paddleY - ballRadius;
            } else {
                // Rebotes laterales, usando ballradius para evitar que la bola supere los límites del canvas
                if (x + dirX > canvas.width - ballRadius || x + dirX < ballRadius) { // Pared derecha e izquierda
                    dirX = -dirX;
                }
                // Rebote superior
                if (y + dirY < ballRadius) {
                    dirY = -dirY;
                }
                const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleW;
                const isBallTouchingPaddle = y + dirY > paddleY;

                if (isBallSameXAsPaddle && isBallTouchingPaddle) {
                    // Calcular la posición relativa de la bola respecto al centro del paddle
                    const relativePosition = (x - paddleX) / paddleW - 0.7;
                    // Ajustar la dirección X de la bola en función de la posición relativa, con un factor mayor para ángulos más pronunciados
                    dirX = 6  * relativePosition;
                    dirY = -dirY;

                    // Limitar el ángulo de rebote incluso en el centro del paddle
                    if (dirX > 4 ) {
                        dirX = 4 ;
                    } else if (dirX < -4 ) {
                        dirX = -4 ;
                    }
                } else if (y + dirY >= canvas.height - ballRadius) { // Suelo
                    lives--; // Decrementar vidas
                    if (lives === 0) {
                        
                        gameActive = false; // Terminar el juego si no quedan vidas
                    } else {
                        ballLaunched = false; // Reiniciar la bola
                        x = canvas.width / 2; // Posicionar la bola en el centro
                        y = canvas.height - 30;
                        paddleX = (canvas.width - paddleW) / 2; // Posicionar la pala en el centro
                    }
                }
                x = dirX + x;
                y = dirY + y;
            }
        }

        function paddleMovement() {
            if (rightPressed && paddleX < canvas.width - paddleW) {
                paddleX = paddleX + 2;
            } else if (leftPressed && paddleX > 0) {
                paddleX = paddleX - 2;
            }
        }

        function cleanCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function initEvents() {
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler); //Cuando suelte la tecla

            function keyDownHandler(event) {
                const {
                    key
                } = event; //Hacemos esto para evitar que pulse las dos teclas
                if (key == 'Right' || key == 'ArrowRight') {
                    rightPressed = true;
                } else if (key == 'Left' || key == 'ArrowLeft') {
                    leftPressed = true;
                } else if (key == ' ' || key == 'Space') { // Presionar la barra espaciadora para lanzar la bola
                    if (!ballLaunched) {
                        ballLaunched = true;
                        // Iniciar movimiento de la bola
                        dirX = 1; // Cambiar la dirección de la bola según tu lógica
                        dirY = -1;
                    }
                }
            }

            function keyUpHandler(event) {
                const {
                    key
                } = event; //Hacemos esto para evitar que pulse las dos teclas
                if (key === 'Right' || key === 'ArrowRight') {
                    rightPressed = false;
                } else if (key === 'Left' || key === 'ArrowLeft') {
                    leftPressed = false;
                }
            }
        }

        function draw() {
            cleanCanvas();

            drawBall();
            drawPaddle();
            drawBricks();
            drawLives(); 

            collisionDetection();
            ballMovement();
            paddleMovement();
            
            if (gameActive) {
                window.requestAnimationFrame(draw); //Se llama a sí mismo, sincronizado con el refresco de pantalla antes de repintar
            } else {
                // Mostrar mensaje de fin de juego
                ctx.font = "30px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
            }

        }

        draw();
        initEvents();