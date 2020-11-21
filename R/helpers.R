#' Prepare inputs for point_to_h3
#'
#' Sets up a variety of possible input objects for
#' \code{\link[h3jsr:point_to_h3]{h3jsr::point_to_h3()}}.
#'
#' @param input `sf`, `sfc` or `sfg` POINT/MULTIPOINT object, data frame or
#'   matrix. Data frames or matrices must have x, y coordinates in their first
#'   two columns. WGS84 input is assumed in all cases.
#' @return `matrix` representation of supplied coordinates.
#' @keywords internal
#' @rdname prep_for_pt2h3
#' @importFrom sf st_crs st_geometry st_set_crs st_sf st_sfc st_transform
#'
prep_for_pt2h3 <- function(input = NULL) {
  UseMethod('prep_for_pt2h3')
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 sf
#' @export
#'
prep_for_pt2h3.sf <-  function(input = NULL) {
  # default is sf style object, all of which are handled the same
  # just pull geom, check and transform
  pts <- sf::st_geometry(input)

  if(!inherits(pts, 'sfc_POINT')) {
    stop('Please supply point geometry.')
  }

  if(is.na(sf::st_crs(pts))) {
    message('Input CRS missing, assuming EPSG:4326.')
    pts <- sf::st_set_crs(pts, 4326)
  }

  if(sf::st_crs(pts)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    pts <- sf::st_transform(pts, 4326)
  }
  sf::st_coordinates(pts)
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 sfc
#' @export
#'
prep_for_pt2h3.sfc <-  function(input = NULL) {
  # just check and transform
  if(!inherits(input, 'sfc_POINT')) {
    stop('Please supply point geometry.')
  }

  if(is.na(sf::st_crs(input))) {
    message('Input CRS missing, assuming EPSG:4326.')
    input <- sf::st_set_crs(input, 4326)
  }

  if(sf::st_crs(input)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    input <- sf::st_transform(input, 4326)
  }

  sf::st_coordinates(input)
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 sfg
#' @export
#'
prep_for_pt2h3.sfg <-  function(input = NULL) {

  if(!inherits(input, 'POINT')) {
    stop('Please supply point geometry.')
  }

  message('Input CRS missing, assuming EPSG:4326.')
  sf::st_coordinates(input)
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 matrix
#' @export
#'
prep_for_pt2h3.matrix <-  function(input = NULL) {
  # assumes input matrix has x, y coords in col 1, 2
  # assumes coords are in 4326
  message('Assuming columns 1 and 2 contain x, y coordinates in EPSG:4326')
  pts <- input[ , 1:2, drop = FALSE]
  colnames(pts) <- c('X', 'Y')
  pts
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 data.frame
#' @export
#'
prep_for_pt2h3.data.frame <-  function(input = NULL) {
  # assumes input df has x, y coords in col 1, 2
  # assumes coords are in 4326
  message('Assuming columns 1 and 2 contain x, y coordinates in EPSG:4326')
  pts <- as.matrix(input[ , c(1,2)])
  colnames(pts) <- c('X', 'Y')
  pts
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 numeric
#' @export
#'
prep_for_pt2h3.numeric <-  function(input = NULL) {
  # assumes input has x, y coords in posns 1, 2
  # assumes coords are in 4326
  message('Assuming positions 1 and 2 contain x, y coordinates in EPSG:4326')
  pts <- matrix(input[c(1,2)], ncol = 2, byrow = TRUE)
  colnames(pts) <- c('X', 'Y')
  pts
}

#' Prepare geometry for polyfill
#'
#' Converts a variety of possible input geometries to geojson for
#' \code{\link[h3jsr:polyfill]{h3jsr::polyfill()}}.
#'
#' @param polys `sf`, `sfc` or `sfg` POLYGON/MULTIPOLYGON object.
#' @return `geojson` representation of supplied geometry.
#' @keywords internal
#' @rdname prep_for_polyfill
#' @importFrom sf st_crs st_geometry st_set_crs st_sf st_sfc st_transform
#' @importFrom geojsonsf sf_geojson
#'
prep_for_polyfill <- function(polys = NULL) {
  UseMethod('prep_for_polyfill')
}

#' @rdname prep_for_polyfill
#' @inherit prep_for_polyfill return
#' @method prep_for_polyfill sf
#' @export
#'
prep_for_polyfill.sf <-  function(polys = NULL) {
  # pull geom, index, cast to JSON (avoids sending other attributes to V8)
  g <- sf::st_geometry(polys)
  if(is.na(sf::st_crs(g))) {
    message('CRS unknown, assuming EPSG:4326.')
    g <- sf::st_set_crs(g, 4326)
  }
  if(sf::st_crs(g)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    g <- sf::st_transform(g, 4326)
  }
  g <- sf::st_sf('ID_H3' = seq(dim(polys)[1]), 'geometry' = g)

  geojsonsf::sf_geojson(g)

}

#' @rdname prep_for_polyfill
#' @inherit prep_for_polyfill return
#' @method prep_for_polyfill sfc
#' @export
prep_for_polyfill.sfc <- function(polys = NULL) {
  # index and cast to JSON
  if(is.na(sf::st_crs(polys))) {
    message('CRS unknown, assuming EPSG:4326.')
    polys <- sf::st_set_crs(polys, 4326)
  }
  if(sf::st_crs(polys)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    polys <- sf::st_transform(polys, 4326)
  }
  g <- sf::st_sf('ID_H3' = seq(polys), 'geometry' = polys)
  geojsonsf::sf_geojson(g)
}

#' @rdname prep_for_polyfill
#' @inherit prep_for_polyfill return
#' @method prep_for_polyfill sfg
#' @export
prep_for_polyfill.sfg <- function(polys = NULL) {
  # cast to sf with index, set crs, cast to JSON
  message('Input CRS unknown, assuming EPSG:4326.')
  g <- sf::st_sf('ID_H3' = 1L, 'geometry' = sf::st_sfc(polys, crs = 4326))
  geojsonsf::sf_geojson(g)
}
