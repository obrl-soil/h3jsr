#' Prepare inputs for point_to_h3
#'
#' Sets up a variety of possible input objects for
#' \code{\link[h3jsr:point_to_h3]{h3jsr::point_to_h3()}}.
#'
#' @param input `sf`, `sfc` or `sfg` POLYGON/MULTIPOLYGON object, data frame or
#'   matrix. Data frames or matrices must have x, y coordinates in their first
#'   two columns.
#' @return `sfc` representation of supplied coordinates. WGS84 input is assumed
#'   where input is non-spatial.
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

  if(!methods::is(pts, 'sfc_POINT')) {
    stop('Please supply point geometry.')
  }

  if(sf::st_crs(pts)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    pts <- sf::st_transform(pts, 4326)
  }

  if(is.na(sf::st_crs(pts))) {
    message('Input CRS missing, assuming EPSG:4326.')
    pts <- sf::st_set_crs(pts, 4326)
  }
  pts
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 sfc
#' @export
#'
prep_for_pt2h3.sfc <-  function(input = NULL) {
  # just check and transform
  if(!methods::is(input, 'sfc_POINT')) {
    stop('Please supply point geometry.')
  }

  if(sf::st_crs(input)$epsg != 4326) {
    message('Data has been transformed to EPSG:4326.')
    input <- sf::st_transform(input, 4326)
  }

  if(is.na(sf::st_crs(input))) {
    message('Input CRS missing, assuming EPSG:4326.')
    input <- sf::st_set_crs(input, 4326)
  }
  input
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 sfg
#' @export
#'
prep_for_pt2h3.sfg <-  function(input = NULL) {
  # just sfc-ise, check geom type and transform
  pts <- sf::st_sfc(input)

  if(!methods::is(pts, 'sfc_POINT')) {
    stop('Please supply point geometry.')
  }

  message('Input CRS missing, assuming EPSG:4326.')
  sf::st_set_crs(pts, 4326)
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 matrix
#' @export
#'
prep_for_pt2h3.matrix <-  function(input = NULL) {
  # assumes input matrix has x, y coords in col 1, 2
  # assumes coords are in 4326
  # cast to sfc_POINT and return
  if(dim(input)[2] < 2 ) {
    stop('Please supply a matrix with x, y coordinates in the first two columns.')
  }
  pts <- data.frame('x' = input[, 1], 'y' = input[, 2])
  message('CRS unknown, assuming EPSG:4326.')
  pts <- sf::st_as_sf(pts, coords = c(1, 2), crs = 4326)
  sf::st_geometry(pts)
}

#' @rdname prep_for_pt2h3
#' @inherit prep_for_pt2h3 return
#' @method prep_for_pt2h3 data.frame
#' @export
#'
prep_for_pt2h3.data.frame <-  function(input = NULL) {
  # assumes input matrix has x, y coords in col 1, 2
  # assumes coords are in 4326
  # cast to sfc_POINT and return
  if(dim(input)[2] < 2 ) {
    stop('Please supply a data frame with x, y coordinates in the first two columns.')
  }
  message('CRS unknown, assuming EPSG:4326.')
  pts <- sf::st_as_sf(input, coords = c(1, 2), crs = 4326)
  sf::st_geometry(pts)
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
