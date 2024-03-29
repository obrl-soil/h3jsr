% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/core_api.R
\name{cell_to_polygon}
\alias{cell_to_polygon}
\title{Get the boundary of an H3 cell index}
\usage{
cell_to_polygon(input = NULL, simple = TRUE)
}
\arguments{
\item{input}{Character; 15-character index generated by H3, or a
vector or list of same, or a data frame where the first column contains H3
addresses.}

\item{simple}{Logical; whether to return an \code{sfc_POLYGON} object or an \code{sf}
data frame containing both inputs and outputs.}
}
\value{
By default, an \code{sfc_POLYGON} object of \code{length(input)}. If an
  appropriately formatted data frame is supplied, an \code{sf} data frame
  containing input attributes and geometry.
}
\description{
This function takes an H3 cell index and returns its bounding shape (usually a
hexagon) in WGS84.
}
\examples{
# What is the hexagon over the Brisbane Town Hall at resolution 10?
brisbane_hex_10 <- cell_to_polygon(input = '8abe8d12acaffff')

# Give me some of the cells over Brisbane Town Hall as an sf object
bth <- sf::st_sfc(sf::st_point(c(153.023503, -27.468920)), crs = 4326)
bth_addys <- unlist(point_to_cell(bth, res = seq(10, 15)), use.names = FALSE)
bth_hexes <- cell_to_polygon(input = bth_addys)
plot(bth_hexes, axes = TRUE)
}
