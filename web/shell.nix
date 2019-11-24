{ pkgs ? import <nixpkgs> {} }:
with pkgs;
with stdenv;
mkDerivation {
  name = "Magic_Recognition";
  buildInputs = [ nodejs python3 ];
  shellHook = ''
    export PATH=node_modules/.bin:$PATH
  '';
}
