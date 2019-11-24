{ pkgs ? import <nixpkgs> {} }:
with pkgs;
with stdenv;
with python37Packages;
mkDerivation {
  name = "Magic_Recognition";
  buildInputs = [ python scikitimage ];
}
