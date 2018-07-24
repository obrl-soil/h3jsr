#' Get h3 address area
#'
#' This function returns the average area of an H3 address at a given
#' resolution.
#' @param res Integer; Desired H3 resolution. See
#'   https://uber.github.io/h3/#/documentation/core-library/resolution-table for
#'   allowable values and related dimensions.
#' @param units Areal unit to report in, either square meters or square
#'   kilometers.
#' @param fast Logical; whether to retieve values from a locally stored table or
#'   reclaculate from source.
#' @return Numeric; average h3 address area.
#' @examples
#' # Return average h3 address area at each resolution in square meters
#' res_area(res = seq(0, 15), units = 'm2')
#'
#' @import V8
#' @importFrom utils data
#' @export
#'
res_area <- function(res = NULL, units = c('m2', 'km2'), fast = TRUE) {

  if(!any(res %in% seq(0, 15))) {
    stop('Please provide a valid H3 resolution. Allowable values are 0-15 inclusive.')
  }

  units <-  match.arg(units)

  if(fast == TRUE) {
    utils::data('h3_info_table')
    h3_info_table <- h3_info_table[h3_info_table$h3_resolution %in% res,
                                   switch(units, 'm2'  = 'avg_area_sqm',
                                                 'km2' = 'avg_area_sqkm')]
    return(h3_info_table)
  } else {
    sesh <- V8::v8()
    sesh$source(system.file('js', 'h3js_bundle.js', package = 'h3jsr'))
    sesh$assign('evalThis', data.frame(res))
    sesh$assign('unit', units)
    # sesh$eval('console.log(unit);')
    # sesh$eval('console.log(JSON.stringify(h3.hexArea(evalThis[0].res, unit));')
    sesh$eval('for (var i = 0; i < evalThis.length; i++) {
                 evalThis[i].area = h3.hexArea(evalThis[i].res, unit);
              };')
    sesh$get('evalThis')
  }
}

#' Get h3 address edge length
#'
#' This function returns the average edge length of an H3 address at a given
#' resolution.
#' @param res Integer; Desired H3 resolution. See
#'   https://uber.github.io/h3/#/documentation/core-library/resolution-table for
#'   allowable values and related dimensions.
#' @param units Length unit to report in, either meters or kilometers.
#' @param fast Logical; whether to retieve values from a locally stored table or
#'   reclaculate from source.
#' @return Numeric; h3 address edge length
#' @note This value is also the hexagon circumradius.
#' @examples
#' # Return average h3 address edge length at each resolution in kilometers
#' res_length(res = seq(0, 15), units = 'km')
#'
#' @import V8
#' @importFrom utils data
#' @export
#'
res_length <- function(res = NULL, units = c('m', 'km'), fast = TRUE) {

  if(!any(res %in% seq(0, 15))) {
    stop('Please provide a valid H3 resolution. Allowable values are 0-15 inclusive.')
  }

  units <-  match.arg(units)

  if(fast == TRUE) {
    utils::data('h3_info_table')
    h3_info_table <- h3_info_table[h3_info_table$h3_resolution %in% res,
                                   switch(units, 'm'  = 'avg_edge_m',
                                                 'km' = 'avg_edge_km')]
    return(h3_info_table)
  } else {
  sesh <- V8::v8()
  sesh$source(system.file('js', 'h3js_bundle.js', package = 'h3jsr'))
  sesh$assign('evalThis', data.frame(res))
  sesh$assign('unit', match.arg(units))
  # sesh$eval('console.log(unit);')
  # sesh$eval('console.log(JSON.stringify(h3.edgeLength(evalThis[0].res, unit));')
  sesh$eval('for (var i = 0; i < evalThis.length; i++) {
               evalThis[i].edgelen = h3.edgeLength(evalThis[i].res, unit);
            };')
  sesh$get('evalThis')
  }

}

#' Get average distance between H3 points
#'
#' This function returns the average distance between the center of H3 address
#' hexagons at a given resolution.
#' @param res Integer; Desired H3 resolution. See
#'   https://uber.github.io/h3/#/documentation/core-library/resolution-table for
#'   allowable values and related dimensions.
#' @param units Length unit to report in, either meters or kilometers.
#' @param fast Logical; whether to retieve values from a locally stored table or
#'   reclaculate from source.
#' @return Numeric; h3 address center separation distance.
#' @note This isn't in the core library but may be useful.
#' @examples
#' # Return average h3 address separation distance at each resolution in kilometers
#' res_cendist(res = seq(0, 15), units = 'km')
#'
#' @import V8
#' @importFrom utils data
#' @export
#'
res_cendist <- function(res = NULL, units = c('m', 'km'), fast = TRUE) {

  if(!any(res %in% seq(0, 15))) {
    stop('Please provide a valid H3 resolution. Allowable values are 0-15 inclusive.')
  }

  units <-  match.arg(units)

  if(fast == TRUE) {
    utils::data('h3_info_table')
    h3_info_table <- h3_info_table[h3_info_table$h3_resolution %in% res,
                                   switch(units, 'm'  = 'avg_cendist_m',
                                                 'km' = 'avg_cendist_km')]
    return(h3_info_table)
  } else {
    crad <- h3jsr::res_length(res = res, units = units, fast = TRUE)
    shortrad <- cos(30 * pi / 180) * crad
    round(shortrad * 2, 8) # no need to go nuts
  }

}

#' Get total H3 addresses
#'
#' This function returns total number of h3 addresses at a given resolution.
#' @param res Integer; Desired H3 resolution. See
#'   https://uber.github.io/h3/#/documentation/core-library/resolution-table for
#'   allowable values and related dimensions.
#' @param fast Logical; whether to retieve values from a locally stored table or
#'   reclaculate from source.
#' @return Numeric; h3 address count.
#' @examples
#' # Return h3 address count for resolution 8
#' res_count(res = 8)
#'
#' @import V8
#' @importFrom utils data
#' @export
#'
res_count <- function(res = NULL, fast = TRUE) {

  if(!any(res %in% seq(0, 15))) {
    stop('Please provide a valid H3 resolution. Allowable values are 0-15 inclusive.')
  }

  if(fast == TRUE) {
    utils::data('h3_info_table', envir = environment())
    h3_info_table <- h3_info_table[h3_info_table$h3_resolution %in% res,
                                   'total_unique_indexes']
    return(h3_info_table)
  } else {
  sesh <- V8::v8()
  sesh$source(system.file('js', 'h3js_bundle.js', package = 'h3jsr'))
  sesh$assign('evalThis', data.frame(res))
  # sesh$eval('console.log(unit);')
  # sesh$eval('console.log(JSON.stringify(h3.numHexagons(evalThis[0].res)));')
  sesh$eval('for (var i = 0; i < evalThis.length; i++) {
            evalThis[i].total_unique_indexes = h3.numHexagons(evalThis[i].res);
            };')
  sesh$get('evalThis')
  }
}

## get all info in a table for fast access
#h3_res_areas <- dplyr::left_join(res_area(seq(0, 15), 'm2'),
#                                 res_area(seq(0, 15), 'km2'), by = 'res')
#names(h3_res_areas) <- c('h3_resolution', 'avg_area_sqm', 'avg_area_sqkm')
#
#h3_res_els <- dplyr::left_join(res_length(seq(0, 15), 'm'),
#                               res_length(seq(0, 15), 'km'), by = 'res')
#names(h3_res_els) <- c('h3_resolution', 'avg_edge_m', 'avg_edge_km')
#
#h3_seps <- cbind(data.frame('avg_cendist_m'  = res_cendist(seq(0, 15), 'm', fast = FALSE)),
#                 data.frame('avg_cendist_km' = res_cendist(seq(0, 15), 'km', fast = FALSE)))
#h3_counts <- res_count(seq(0, 15))
#names(h3_counts) <- c('h3_resolution', 'total_unique_indexes')
#
#h3_info_table <- dplyr::left_join(h3_res_areas, h3_res_els, by = 'h3_resolution')
#h3_info_table <- cbind(h3_info_table, h3_seps)
#h3_info_table <- dplyr::left_join(h3_info_table, h3_counts, by = 'h3_resolution')
