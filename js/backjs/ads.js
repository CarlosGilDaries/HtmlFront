// Función para cargar los anuncios dinámicos
async function loadAds(movieSlug) {
    try {
        const response = await fetch(`/api/ads/${movieSlug}`);
        const data = await response.json();
        const movie = data.movie;

        // Asegurar que 'ads' sea un array
        if (Array.isArray(data.ads.ads)) {
            return {
                movie: movie,
                ads: data.ads.ads.map((ad) => ({
                    type: ad.type,
                    ad_movie_type: ad.pivot?.type || "unknown", // Usa 'unknown' si 'pivot' o 'type' no están definidos
                    src: ad.url,
                    time: ad.pivot?.midroll_time || 0, // Valor por defecto 0 si 'pivot' o 'midroll_time' no están definidos
                    skippable: ad.pivot.skippable,
                    skip_time: ad.pivot?.skip_time || 0,
                })),
            };
        } else {
            console.error("No se encontraron anuncios");
            return {
                movie: movie,
                ads: [],
            };
        }
    } catch (error) {
        console.error("Error al cargar los anuncios:", error);
        return {
            movie: null,
            ads: [],
        };
    }
}


// Esperar a que Video.js esté listo
var player = videojs("my-video", {}, async function () {
    console.log("Video.js inicializado");

    let postRoll = false;
    let playedMidrolls = new Set(); // Almacena los midrolls ya reproducidos
    let pendingMidrolls = []; // Almacena los midrolls que aún deben reproducirse
    let isPlayingMidroll = false; // Indica si se está reproduciendo un midroll
    let tiempoGuardado = 0; // Variable para guardar el tiempo antes del midroll

    // Obtener el slug de la película desde la URL actual
    const pathParts = window.location.pathname.split("/");
    const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL

    const { movie, ads } = await loadAds(movieSlug);

    const movieUrl = movie.url;
    const movieType = movie.type;

    // Inicializar ads
    player.ads();

    player.src({
        src: movieUrl,
        type: movieType,
    });

    // Para forzar el reinicio al darle a play después del postroll
    player.on("contentended", function () {
        player.one("play", function () {
            console.log("Reiniciando");
            player.currentTime(0);
            player.play();
        });
    });

    // PREROLL
    const preroll = ads.find((ad) => ad.ad_movie_type === "preroll");
    if (preroll) {
        player.one("play", function () {
            
        });
        player.on("readyforpreroll", function () {
            player.ads.startLinearAdMode();
            player.src({
                src: preroll.src,
                type: preroll.type
            });

            // Cuando el anuncio empiece, quitar el loader
            player.one("adplaying", function () {
                player.trigger("ads-ad-started");
                skippableAd(player, preroll);
            });

            player.one("adended", function () {
                player.ads.endLinearAdMode();
                player.src({
                    src: movieUrl,
                    type: movieType,
                });
            });
        });
    } else {
        player.trigger("nopreroll");
    }

    // MIDROLLS
    player.on("timeupdate", function () {
        if (isPlayingMidroll) return; // No hacer nada si ya estamos en un midroll

        let currentTime = player.currentTime();

        // Filtrar los midrolls que aún no se han reproducido y deberían haberse activado
        let newMidrolls = ads
            .filter((ad) => ad.ad_movie_type === "midroll")
            .filter(
                (midroll) =>
                    !playedMidrolls.has(midroll.time) &&
                    currentTime >= midroll.time &&
                    !pendingMidrolls.some((p) => p.time === midroll.time) // Evitar duplicados
            );

        // Agregar los nuevos midrolls pendientes y ordenarlos por tiempo
        pendingMidrolls.push(...newMidrolls);
        pendingMidrolls.sort((a, b) => a.time - b.time);

        // Si hay midrolls pendientes y no se está reproduciendo un anuncio, reproducir el primero
        if (pendingMidrolls.length > 0 && !player.ads.isAdPlaying()) {
            playNextMidroll();
        }
    });

    function playNextMidroll() {
        if (pendingMidrolls.length === 0) {
            isPlayingMidroll = false;
            return; // Si no hay más midrolls, salir
        }

        // Evitar iniciar un anuncio si ya está en modo de anuncio
        if (player.ads.isInAdMode()) {
            return;
        }

        isPlayingMidroll = true; // Indicar que un midroll está en reproducción

        let midroll = pendingMidrolls.shift(); // Obtener el siguiente midroll en la lista
        playedMidrolls.add(midroll.time); // Marcarlo como reproducido
        tiempoGuardado = player.currentTime();

        player.ads.startLinearAdMode();
        player.src({
            src: midroll.src,
            type: midroll.type,
        });

        player.one("adplaying", function () {
            player.trigger("ads-ad-started");
        });

        player.one("adended", function () {
            player.ads.endLinearAdMode();
            isPlayingMidroll = false; // Permitir nuevos midrolls
            player.src({
                src: movieUrl,
                type: movieType,
            });

            player.one("loadedmetadata", function () {
                player.currentTime(tiempoGuardado);
                player.play();

                // Si quedan más midrolls, reproducir el siguiente
                if (pendingMidrolls.length > 0) {
                    setTimeout(playNextMidroll, 500); // Pequeña pausa para evitar problemas de carga
                }
            });
        });

        skippableAd(player, midroll);
    }

    // POSTROLL
    const postroll = ads.find((ad) => ad.ad_movie_type === "postroll");
    if (postroll) {
        player.on("contentended", function () {
            player.on("readyforpostroll", function () {
                postRoll = true;
                player.ads.startLinearAdMode();
                player.src({
                    src: postroll.src,
                    type: postroll.type,
                });

                player.one("adplaying", function () {
                    player.trigger("ads-ad-started");
                    skippableAd(player, postroll);
                });

                player.one("adended", function () {
                    player.ads.endLinearAdMode();
                    player.src({
                        src: movieUrl,
                        type: movieType,
                    });
                    player.trigger("ended");
                });
            });
        });

    } else {
        player.trigger("nopostroll");
    }

    player.trigger("adsready");

    function skippableAd(player, currentAd) {
        if (currentAd && currentAd.skippable == 1) {

            // Crear botón de "Saltar anuncio"
            var skipButton = document.createElement("button");
            skipButton.id = "skipAdsButton";
            skipButton.innerText = "Saltar en " + currentAd.skip_time;
            skipButton.style.position = "absolute";
            skipButton.style.bottom = "40px";
            skipButton.style.right = "20px";
            skipButton.style.padding = "10px";
            skipButton.style.background = "rgba(0, 0, 0, 0.7)";
            skipButton.style.color = "white";
            skipButton.style.border = "none";
            skipButton.style.cursor = "pointer";
            skipButton.style.display = "block";
            skipButton.disabled = true;

            player.el().appendChild(skipButton);

            // Iniciar cuenta atrás del skipButton
            var countdown = currentAd.skip_time;
            var countdownInterval;

            // Función para iniciar o reiniciar la cuenta atrás
            function startCountdown() {
                countdownInterval = setInterval(function () {
                    if (!player.paused()) {
                        countdown--;
                        skipButton.innerText = "Saltar en " + countdown;
                        if (countdown === 0) {
                            clearInterval(countdownInterval);
                            skipButton.innerText = "Saltar anuncio";
                            skipButton.disabled = false;
                        }
                    }
                }, 1000);
            }

            startCountdown();

            // Saltar anuncio
            skipButton.addEventListener("click", function () {
                console.log("Anuncio saltado");
                skipButton.remove();
                clearInterval(countdownInterval);
                player.ads.endLinearAdMode();
                isPlayingMidroll = false;

                setTimeout(function () {
                    if (pendingMidrolls.length > 0) {
                        playNextMidroll();
                    }
                }, 500);
            });

           // Eliminar el botón cuando termine el anuncio
            player.on("adend", function () {
                skipButton.remove();
                clearInterval(countdownInterval);
            });

            // Detener el contador cuando el anuncio está pausado
            player.on("pause", function () {
                clearInterval(countdownInterval);
            });

            // Reiniciar la cuenta atrás si el anuncio se reanuda
            player.on("play", function () {
                if (!skipButton.disabled) {
                    startCountdown();
                }
            });
        }
    }
});
