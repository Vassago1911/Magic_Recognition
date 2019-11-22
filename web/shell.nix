{ pkgs ? import <nixpkgs> {} }:
with pkgs;
with stdenv;
mkDerivation {
  name = "Magic_Recognition";
  buildInputs = [ nodejs ];
  shellHook = ''
    export PATH=node_modules/.bin:$PATH
  '';
}
