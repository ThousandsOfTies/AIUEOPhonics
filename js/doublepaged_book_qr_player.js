class QrPlayer {
    constructor(root_selector) {
        this.root_selector = root_selector;
        this.playlist = [];
        let ado = document.createElement('audio');
        ado.setAttribute('src', '');
        document.querySelector(this.root_selector).appendChild(ado);
        this.playing = false;
        this.audio = document.querySelector(this.root_selector + ' ' + 'audio');
        this.audio.addEventListener('play', (e) => {
            this.playing = true;
            return;
        });
        this.audio.addEventListener('pause', (e) => {
            this.playing = false;
            return;
        });
        this.audio.addEventListener('ended', (e) => {
            if (this.playlist.length) {
                this.shiftplay();
                return;
            }
            this.playing = false;
            return;
        });
    }
    shiftplay_back() {
        if (this.playlist.length) {
            this.audio.src = this.src = this.playlist.shift();
            this.audio.play();
        }
        return;
    }
    shiftplay() {
        this.audio.src = this.src = this.playlist.shift();
        this.audio.play();
        return;
    }
    playpause(playlist) {
        if (playlist.includes(this.src)) {
            // 現在再生中の素材が含まれるリストがわたってきたらリスト更新を行わない。
            // 結果的にthis.playlistが空だったらundefineがsrcに設定され停止し、空ではなかったら次の素材が再生される。
            ;
        } else {
            let pl = [];
            playlist.forEach((src) => {
                pl.push(src);
            });
            this.playlist = pl;
        }
        this.shiftplay();
        return;
    }
    playpause_bak(playlist) {
        if (this.playing && this.playlist.length == 0 && playlist.includes(this.src)) {
            this.audio.pause();
            this.playlist = [];
            return;
        }
        if (this.playlist.length) {
            this.shiftplay();
            return;
        }
        let pl = [];
        playlist.forEach((src) => {
            pl.push(src);
            return;
        });
        this.playlist = pl;
        this.shiftplay();
        return;
    }
}

class DoublePagedBookQrPlayer {
    constructor(root_selector, setting_file_dir) {
        this.root_selector = root_selector;
        this.player = new QrPlayer(this.root_selector);
        this.setting_file_dir = setting_file_dir;
    };
    init = () => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = './' + this.setting_file_dir + '/setting.json'; // Global変数page_settingsに設定が読み込まれる。
        if (script.readyState) {
            script.onreadystatechange = () => {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    this.addElements();
                };
            };
        } else {
            script.onload = () => {
                this.addElements();
            };
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    addElements = () => {
        page_settings.forEach((page_setting) => {
            let d = document.createElement('div');
            d.setAttribute('class', 'pages');
            page_setting.forEach((page) => {
                let a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0)');

                let i = document.createElement('img');
                i.setAttribute('class', 'page');
                let src = this.setting_file_dir + '/images/' + page.src;
                i.setAttribute('src', src);
                i.setAttribute('data-src', src);
                i.setAttribute('alt', 'page');

                a.appendChild(i);
                d.appendChild(a);
            });
            document.querySelector(this.root_selector).appendChild(d);
        });
        function handlerClick(e) {
            let x = e.offsetX * (e.target.naturalWidth / e.target.width);
            let y = e.offsetY * (e.target.naturalHeight / e.target.height);

            let canvasElement = document.createElement("canvas");
            let ctx = canvasElement.getContext('2d', { willReadFrequently: true });
            const LEN = 160;
            ctx.drawImage(e.target, x - LEN / 2, y - LEN / 2, LEN, LEN, 0, 0, LEN, LEN);
            let imageData = ctx.getImageData(0, 0, LEN, LEN);

            let code = jsQR(imageData.data, imageData.width, imageData.height);
            window.open(code.data, "_new");
        }
        document.querySelectorAll(this.root_selector + ' ' + 'a').forEach((elm) => {
            elm.addEventListener('mouseup', (e) => {
                handlerClick(e);
            });
        });
        document.querySelectorAll(this.root_selector + ' ' + 'a').forEach((elm) => {
            elm.addEventListener('touchend', (e) => {
                handlerClick(e);
            });
        });
    };
}