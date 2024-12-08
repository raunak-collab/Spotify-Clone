let currentSong = new Audio();
let songs = [];
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:5500/Spotify%20Clone/${folder}/`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName('a');
        songs = [];

        for (let element of as) {
            if (element.href.endsWith('.mp3')) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
            }
        }
        console.log('Songs fetched:', songs);

        let songUL = document.querySelector('.songlist ul');
        if (songUL) {
            songUL.innerHTML = "";
            for (const song of songs) {
                let li = document.createElement('li');
                li.innerHTML = `
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replace(/%20/g, " ")}</div>
                        <div>Raunak</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>`;
                songUL.appendChild(li);
            }

            Array.from(document.querySelectorAll('.songlist li')).forEach((e) => {
                e.addEventListener('click', () => {
                    playMusic(e.querySelector('.info div').innerText.trim());
                });
            });
        } else {
            console.error('songUL element not found');
        }
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playMusic = (track, pause = false) => {
    console.log(`Attempting to play: ${track}`);
    currentSong.src = `${currFolder}/` + track;
    currentSong.load();
    if (!pause) {
        currentSong.play().then(() => {
            console.log(`Playing: ${track}`);
        }).catch((error) => {
            console.error(`Error playing ${track}:`, error);
        });
        document.getElementById('play').src = 'img/pause.svg';
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        let response = await fetch(`http://127.0.0.1:5500/Spotify%20Clone/nasheeds/`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/nasheeds/")) {
                let folder = (e.href.split("/").slice(-1)[0]);
                let response = await fetch(`http://127.0.0.1:5500/Spotify%20Clone/nasheeds/${folder}/info.json`);
                let text = await response.json();
                console.log(text);
                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="53" height="52">
                            <circle cx="12" cy="12" r="11" fill="#1ed760" />
                            <circle cx="12" cy="12" r="10" stroke="" stroke-width="1.5" fill="none" />
                            <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="#000000" />
                        </svg>
                    </div>
                    <img src="nasheeds/${folder}/cover.jfif" alt="">
                    <h2>${text.title}</h2>
                    <p>${text.description}</p>
                </div>`;
            }
        }
        // load The Playlist When Card Is Clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                await getSongs(`nasheeds/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0])
            });
        });
    } catch (error) {
        console.error('Error fetching albums:', error);
    }
}

async function main() {
    await getSongs("nasheeds/ncs");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    } else {
        console.error('No songs found or error in fetching songs');
    }

    displayAlbums();

    let playButton = document.getElementById('play');
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (currentSong.paused) {
                currentSong.play();
                playButton.src = 'img/pause.svg';
            } else {
                currentSong.pause();
                playButton.src = 'img/play.svg';
            }
        });
    } else {
        console.error('play button not found');
    }

    let prevButton = document.getElementById('previous');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            let index = songs.indexOf(decodeURIComponent(currentSong.src.split('/').pop()));
            if (index > 0) {
                playMusic(songs[index - 1]);
            } else {
                console.warn('No previous song found');
            }
        });
    } else {
        console.error('previous button not found');
    }

    let nextButton = document.getElementById('next');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            let index = songs.indexOf(decodeURIComponent(currentSong.src.split('/').pop()));
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                console.warn('No next song found');
            }
        });
    } else {
        console.error('next button not found');
    }

    currentSong.addEventListener('timeupdate', () => {
        const currentTimeInSeconds = Math.floor(currentSong.currentTime);
        const durationInSeconds = Math.floor(currentSong.duration);
        const currentTimeFormatted = convertSecondsToMinutes(currentTimeInSeconds);
        const durationFormatted = convertSecondsToMinutes(durationInSeconds);
        document.querySelector('.songTime').innerHTML = `${currentTimeFormatted} / ${durationFormatted}`;
        document.querySelector('.circle').style.left = (currentTimeInSeconds / durationInSeconds) * 100 + '%';
    });

    function convertSecondsToMinutes(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    let seekbar = document.querySelector('.seekbar');
    if (seekbar) {
        seekbar.addEventListener('click', (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector('.circle').style.left = percent + '%';
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });
    } else {
        console.error('seekbar element not found');
    }

    let hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.querySelector('.left').style.left = '0';
        });
    } else {
        console.error('hamburger element not found');
    }

    let closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.querySelector('.left').style.left = '-100%';
        });
    } else {
        console.error('close button not found');
    }

    let volumeInput = document.querySelector('.range input');
    if (volumeInput) {
        volumeInput.addEventListener('change', (e) => {
            console.log('Setting Volume To ', e.target.value, ' / 100');
            currentSong.volume = parseInt(e.target.value) / 100;
        });
    } else {
        console.error('volume input not found');
    }


// Add Event Listener To Mute to Track
document.querySelector(".volume>img").addEventListener("click", e=>{
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        volumeInput.value = 0;
        currentSong.volume = 0;
        console.log('Volume is muted');
        
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        console.log('Volume Is not muted');
        currentSong.volume = .20;
        volumeInput.value = 20;
        
    }
    
})





}

main();
