#!/bin/bash
echo 'Welcome to RPL!'
if ! command -v wget &> /dev/null
then
    echo "wget could not be found! please install wget and try again."
    exit
fi

install_light() {
  mkdir -p rpl-light-1.4.0-release
  cd rpl-light-1.4.0-release
  wget https://coredoes.dev/mirror/rpl/rpl-light-1.4.0-release.tar.xz -O - | tar xvfj
  cd ..
  echo 'Done! Successfully installed to ./rpl-light-1.4.0-release/'
  exit
}

install_full() {
  mkdir -p rpl-1.4.0-release
  cd rpl-1.4.0-release
  wget https://coredoes.dev/mirror/rpl/rpl-1.4.0-release.tar.xz -O - | tar xvfj
  cd ..
  echo 'Done! Successfully installed to ./rpl-1.4.0-release/'
  exit
}

while true; do
    read -p "Do you wish to install the full version of rpl? [Y/n] " yn
    case $yn in
        [Yy]* ) install_full;;
        [Nn]* ) install_light;;
        * ) echo "Please answer yes or no.";;
    esac
done