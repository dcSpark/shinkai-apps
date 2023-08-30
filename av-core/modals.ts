export function visorPromptModal() {
  const background = document.createElement('div');
  background.style.cssText = 'display:none;opacity:0;background-color:rgb(0,0,0,0.7);position:fixed;top:0;left:0;width:100%;height:100%;transition: top 2s, opacity 2s;z-index:2147483646';
  background.id = "agrihan-visor-modal-bg";
  const foreground = document.createElement('div');
  foreground.id = "agrihan-visor-modal-fg";
  foreground.style.cssText = 'color:white;background-color:black;border:3px solid red;position:fixed;top:20px;right:50px;width:200px;height:200px;padding:0.5rem;text-align:center;font-weight:700;z-index:2147483647';
  const logo = document.createElement('div');
  logo.style.cssText = "margin: auto"
  logo.innerHTML = `
  <svg width="70" height="70" viewBox="0 0 189 131" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50.0064 0C44.6958 0 28.0999 10.375 26.1084 12.2614L29.2616 20.4356L48.7799 30.741C51.3799 27.073 55.4831 16.6629 56.6448 10.6894C57.5768 5.89692 55.3171 0 50.0064 0Z" fill="url(#paint0_linear_114_28)"/>
  <path d="M189 63.8201C189 54.4017 182.609 51.2622 177.917 52.2536C158.563 59.0283 122.996 54.8974 107.447 50.436C91.8973 45.9747 57.3242 30.6077 51.0382 28.2944C33.1727 22.0155 26.9468 14.5799 26.1201 12.2666C11.728 52.0884 -19.4313 102.456 17.1272 119.504C72.0472 145.116 145.99 120.165 161.209 109.26C176.428 98.3543 189 73.2385 189 63.8201Z" fill="#00B171"/>
  <mask id="mask0_114_28" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="12" width="189" height="119">
  <path d="M188.901 63.8948C188.901 54.4724 182.514 51.3317 177.825 52.3235C158.485 59.1009 122.944 54.9683 107.405 50.5051C91.8667 46.0419 57.3182 30.6687 51.0366 28.3544C33.1838 22.0729 26.9623 14.6342 26.1362 12.3199C11.7544 52.1582 -19.3828 102.547 17.1497 119.602C72.0307 145.224 145.921 120.263 161.129 109.353C176.337 98.4433 188.901 73.3171 188.901 63.8948Z" fill="#00B171"/>
  </mask>
  <g mask="url(#mask0_114_28)">
  <path d="M19.1936 145.781L77.8762 4.55055L132.799 25.8005L88.1742 151.339L19.1936 145.781Z" fill="url(#paint1_linear_114_28)"/>
  <ellipse cx="50.6305" cy="67.6561" rx="52.3136" ry="91.5041" transform="rotate(23.6845 50.6305 67.6561)" fill="url(#paint2_linear_114_28)"/>
  <path d="M73.2879 97.3029C128.323 103.911 187.396 58.2952 195.109 53.8428L182.896 156.074L84.5292 180.621L-37.9013 66.3106C-19.1832 74.4386 29.2599 92.0163 73.2879 97.3029Z" fill="url(#paint3_linear_114_28)"/>
  </g>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M50.1332 56.5836C41.1595 52.4827 32.7068 55.95 27.1697 59.797C21.5827 63.6786 17.3509 68.9603 15.5447 72.0572L22.4552 76.0877C23.7348 73.8937 27.1995 69.5175 31.7342 66.367C36.2795 63.2092 41.6137 61.4647 46.8507 63.8794L46.9194 63.9111L46.9892 63.9402C48.8137 64.6991 50.2634 66.1003 51.5379 67.9234C52.5026 69.3034 53.1907 70.6334 53.8971 71.9988C54.1825 72.5504 54.4708 73.1077 54.7815 73.6764C54.9622 74.0071 55.1748 74.42 55.4154 74.8872C56.1186 76.253 57.0609 78.0832 58.1455 79.6838C59.7038 81.9835 61.9032 84.416 65.1981 85.9393C70.4603 88.3721 76.0995 87.489 80.3844 85.368C84.7208 83.2215 88.2908 79.6646 90.7728 76.1905L84.2634 71.54C82.3107 74.2733 79.6767 76.7918 76.8354 78.1983C74.0977 79.5534 71.0589 79.8353 68.5552 78.6778C67.0354 77.9752 65.8466 76.7875 64.7683 75.1961C63.9697 74.0176 63.3975 72.9042 62.7708 71.6846C62.4706 71.1005 62.1579 70.4921 61.8019 69.8404C61.6353 69.5356 61.4386 69.1549 61.2137 68.7198C60.4612 67.2636 59.3944 65.1991 58.0946 63.3397C56.3377 60.8266 53.8274 58.1412 50.1332 56.5836Z" fill="url(#paint4_linear_114_28)"/>
  <defs>
  <linearGradient id="paint0_linear_114_28" x1="41.4789" y1="0" x2="41.4789" y2="30.741" gradientUnits="userSpaceOnUse">
  <stop stop-color="#03A268"/>
  <stop offset="1" stop-color="#005738" stop-opacity="0.88"/>
  </linearGradient>
  <linearGradient id="paint1_linear_114_28" x1="29.4917" y1="38.0601" x2="104.847" y2="140.06" gradientUnits="userSpaceOnUse">
  <stop stop-color="#11DE94"/>
  <stop offset="1" stop-color="#11DE94" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="paint2_linear_114_28" x1="62.5199" y1="43.0204" x2="-12.2066" y2="85.8061" gradientUnits="userSpaceOnUse">
  <stop stop-color="#72FFCC" stop-opacity="0.59"/>
  <stop offset="1" stop-color="#47EAAF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="paint3_linear_114_28" x1="135.184" y1="170.568" x2="85.6661" y2="51.9512" gradientUnits="userSpaceOnUse">
  <stop stop-color="#004F32"/>
  <stop offset="1" stop-color="#00B171" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="paint4_linear_114_28" x1="53.1588" y1="54.7361" x2="42.1725" y2="86.5655" gradientUnits="userSpaceOnUse">
  <stop stop-color="white"/>
  <stop offset="1" stop-color="white" stop-opacity="0"/>
  </linearGradient>
  </defs>
  </svg>
      `
  const arrow = document.createElement("p");
  arrow.innerText = "↑";
  arrow.style.cssText = "font-size: 3rem; margin: 0";
  const message = document.createElement("p");
  message.style.cssText = "margin-top: 0; margin-bottom: 2px; overflow: hidden;"
  message.id = "agrihan-visor-modal-text";
  foreground.appendChild(arrow);
  foreground.appendChild(message);
  foreground.appendChild(logo);
  background.appendChild(foreground);
  return background
}

export function inject(node) {
  document.body.appendChild(node);
}

export function showPopup(text: string) {
  const background = document.getElementById("agrihan-visor-modal-bg");
  if (background) {
    background.style.display = "block";
    background.style.opacity = "0.9";
    const modalText = document.getElementById("agrihan-visor-modal-text");
    if (modalText) modalText.innerText = text;
    setTimeout(() => background.style.display = "none", 3000);
  }
}

export function promptUnlock() {
  showPopup("Connect to a ship with your Agrihan Visor");
}
export function promptPerms() {
  showPopup("Open your Agrihan Visor to grant permissions.");
}

