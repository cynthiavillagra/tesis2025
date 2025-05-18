-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-05-2025 a las 05:02:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `chatbot_tesis`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`) VALUES
(1, 'Juan', 'Pérez'),
(2, 'Ana', 'García'),
(3, 'Luis', 'Martínez'),
(4, 'María', 'López'),
(5, 'Carlos', 'Sánchez'),
(33, 'Gabriela', 'Suarez'),
(38, 'Maria', 'Ordoñez'),
(49, 'Juan', 'Carlos'),
(50, 'Juan', 'Perez'),
(51, 'juan', 'perez'),
(52, 'El', 'Nombre Es Juan Y El Apellido Perez'),
(53, 'El', 'Nombre Se Llama Maria Y Apellida Suarez'),
(54, 'Se', 'Llama Maria Como Apellido Le Dicen Perez'),
(55, 'Juan', 'Carlos'),
(56, 'Juan', 'Pedro'),
(57, 'Juan', 'Carlos'),
(58, 'Se', 'Llama Juan Y El Apellido Es Perez'),
(59, 'El', 'Nombre Es Maria Y Apellido Gomez'),
(60, 'El', 'Nombre Es Juan Y Sde Apellida Perez'),
(61, 'El', 'Nombre Del Usuario Es Juan Y El Apellido Es Garcia'),
(62, 'Juan', 'Garcia'),
(63, 'juan', 'garcia'),
(64, 'Juan', 'Gracia'),
(65, 'Juana', 'Gracia'),
(66, 'juan', 'pedro'),
(67, 'Maria', 'Ordoñez'),
(68, 'Lorenz', 'Garvia'),
(69, 'Cynthia', 'Gracia'),
(70, 'Juana', 'Perez'),
(71, 'Aun', 'Usuario'),
(72, 'Juan', 'Bastian'),
(73, 'Maya', 'Gomez'),
(74, 'Maira', 'Gómez'),
(75, 'Juana', 'Molina'),
(76, 'Juana', 'Mer'),
(77, 'Juan', 'Pérez'),
(78, 'Juan', 'Ho'),
(79, 'Juna', 'Ho'),
(80, 'Juna', 'Garcia'),
(81, 'Ector', 'Chino'),
(82, 'Hector', 'Chino'),
(83, 'Hector', 'Las'),
(84, 'Juan', 'Suárez'),
(85, 'Juna', 'Petri'),
(86, 'Nicolás', 'Pérez'),
(87, 'María', 'Pérez'),
(88, 'Francisco', 'Torres'),
(89, 'Francisco', 'Toro'),
(90, 'María', 'Pérez');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
