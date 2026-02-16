// On déclare les sous-modules
pub mod bus;
pub mod controller;

// On "ré-exporte" les types pour que l'utilisateur
// puisse faire `use crate::servo::ServoBus` ou `use super::servo::ServoBus`
pub use bus::ServoBus;
