context('Core H3 API')

test_that(
  'is_valid returns correctly',
  c(
    val1 <- is_valid(h3_address = '8abe8d12acaffff'),
    val2 <- is_valid(h3_address = c('whereami', '8abe8d12acaffff')),
    val3 <- is_valid(h3_address = c('whereami', '8abe8d12acaffff'),
                        simple = FALSE),
    expect_equal(val1, TRUE),
    expect_equal(val2, c(FALSE, TRUE)),
    expect_is(val3, 'data.frame'),
    expect_is(val3$h3_address, 'character'),
    expect_equal(val3$h3_valid, c(FALSE, TRUE))
  )
)

test_that(
  'is_pentagon returns correctly',
  c(
    expect_error(is_pentagon(h3_address = 'whereami')),
    val1 <- is_pentagon(h3_address = '8abe8d12acaffff'),
    val2 <- is_pentagon(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_equal(val1, FALSE),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_equal(val2$h3_pentagon, FALSE)
    # note to self find the addy of a pentagon
  )
)

# is_rc3
test_that(
  'is_rc3 returns correctly',
  c(
    expect_error(is_rc3(h3_address = 'whereami')),
    val1 <- is_rc3(h3_address = '8abe8d12acaffff'),
    val2 <- is_rc3(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_equal(val1, FALSE),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_equal(val2$h3_rc3, FALSE)
  )
)

test_that(
  'get_base_cell returns correctly',
  c(
    expect_error(get_base_cell(h3_address = 'whereami')),
    val1 <- get_base_cell(h3_address = '8abe8d12acaffff'),
    val2 <- get_base_cell(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_equal(val1, 95L),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_equal(val2$h3_base_cell, 95L)
  )
)

test_that(
  'get_res returns correctly',
  c(
    expect_error(get_res(h3_address = 'whereami')),
    val1 <- get_res(h3_address = '8abe8d12acaffff'),
    val2 <- get_res(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_equal(val1, 10L),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_equal(val2$h3_res, 10L)
  )
)

test_that('prep_for_pt2h3 works consistently across methods',
          c(# matrix method
            bth_mat <- matrix(c(153.023503, -27.468920), ncol = 2),
            bth_mat_m <- matrix(c(bth_mat, bth_mat, bth_mat),
                                ncol = 2, byrow = TRUE),
            val1 <- h3jsr:::prep_for_pt2h3(bth_mat),
            val2 <- h3jsr:::prep_for_pt2h3(bth_mat_m),
            expect_is(val1, 'sfc'),
            expect_is(val2, 'sfc'),
            expect_message(h3jsr:::prep_for_pt2h3(bth_mat)),
            # df method
            bth_df <- as.data.frame(bth_mat),
            bth_df_m <-  as.data.frame(bth_mat_m),
            val3 <- h3jsr:::prep_for_pt2h3(bth_df),
            val4 <- h3jsr:::prep_for_pt2h3(bth_df_m),
            expect_equal(val1, val3),
            expect_equal(val2, val4),
            expect_message(h3jsr:::prep_for_pt2h3(bth_df)),
            # sfg method
            bth_sfg <- sf::st_point(bth_mat),
            val5 <- h3jsr:::prep_for_pt2h3(bth_sfg),
            expect_equivalent(val1, val5), # attrib order differs, meh
            expect_message(h3jsr:::prep_for_pt2h3(bth_sfg)),
            # sfc method
            bth_sfc   <- sf::st_sfc(bth_sfg, crs = 4326),
            bth_sfc_m <-
              sf::st_as_sfc(list(bth_sfg, bth_sfg, bth_sfg), crs = 4326),
            val6 <- h3jsr:::prep_for_pt2h3(bth_sfc),
            val7 <- h3jsr:::prep_for_pt2h3(bth_sfc_m),
            expect_equal(val5, val6),
            expect_equivalent(val2, val7), # attrib order
            bth_sfc2 <- sf::st_sfc(bth_sfg, crs = 4283),
            expect_message(h3jsr:::prep_for_pt2h3(bth_sfc2)),
            # sf method
            bth_sf <- sf::st_sf('geometry' = bth_sfc),
            bth_sf_m <- sf::st_sf('geometry' = bth_sfc_m),
            val8 <- h3jsr:::prep_for_pt2h3(bth_sf),
            val9 <- h3jsr:::prep_for_pt2h3(bth_sf_m),
            expect_equal(val6, val8),
            expect_equal(val7, val9),
            bth_sf2 <- sf::st_sf('geometry' = bth_sfc2),
            expect_message(h3jsr:::prep_for_pt2h3(bth_sf2))
          ))

test_that('point_to_h3 with various options',
          c(bpts <- list(c(153.02350, -27.46892),
                         c(153.02456, -27.47071),
                         c(153.02245, -27.47078)),
            bpts <- lapply(bpts, sf::st_point),
            bpts_sfc <- sf::st_sfc(bpts, crs = 4326),
            bpts_sf <- sf::st_sf('geometry' = bpts_sfc),
            # several points 1 res
            expect_error(point_to_h3(bpts_sfc, res = 25)),
            val1 <- point_to_h3(bpts_sfc, res = 11),
            val2 <- point_to_h3(bpts_sfc, res = 11, simple = FALSE),
            expect_equal(val1[1], '8bbe8d12acadfff'),
            expect_is(val2, 'data.frame'),
            # several points several res
            val3 <- point_to_h3(bpts_sfc, res = c(11,12)),
            val4 <- point_to_h3(bpts_sfc, res = c(11,12), simple = FALSE),
            expect_identical(val3, val4),
            expect_identical(val2$h3_resolution_11, val3$h3_resolution_11,
                             val4$h3_resolution_11),
            # sf object with other attribs
            bpts_sf2 <- sf::st_sf('ID' = seq(length(bpts_sfc)),
                                  'geometry' = bpts_sfc),
            val5 <-  point_to_h3(bpts_sf2, res = c(11,12), simple = FALSE),
            expect_is(val5, 'data.frame'),
            expect_equal(names(val5), c('ID', 'h3_resolution_11', 'h3_resolution_12')),
            expect_equal(val5[[1]], c(1,2,3)),
            # df with other attribs
            bpts_df2 <-
              as.data.frame(cbind(matrix(unlist(bpts_sfc),
                                         ncol = 2, byrow = T), 'ID' = seq(3))),
            val6 <- point_to_h3(bpts_df2, res = c(11, 12), simple = FALSE),
            expect_equal(val5, val6)
           )
          )


test_that('h3_to_point returns an appropriate dataset',
          c(
            expect_error(h3_to_point(h3_address = 'whereami')),
            val1 <- h3_to_point('8abe8d12acaffff'),
            val2 <- h3_to_point('8abe8d12acaffff', simple = FALSE),
            expect_is(val1, 'sfc_POINT'),
            expect_equal(val1, val2$geometry),
            # lock in in case underlying fn gets fixed
            expect_equal(val1[[1]][1], 153.0239032),
            expect_equal(val1[[1]][2], -27.46852938),
            expect_is(val2, 'sf'),
            expect_equal(names(val2), c('h3_address', 'h3_resolution', 'geometry'))
          ))

# h3_to_geo_boundary
test_that('h3 to polygon returns an appropriate dataset',
          c(
            expect_error(h3_to_polygon(h3_address = 'whereami')),
            val1 <- h3_to_polygon('8abe8d12acaffff'),
            val2 <- h3_to_polygon('8abe8d12acaffff', simple = FALSE),
            # xy checks
            expect_equal(val1[[1]][[1]][1,1], 153.0245835),
            expect_equal(val1[[1]][[1]][1,2], -27.46896347),
            expect_is(val1, 'sfc_POLYGON'),
            expect_is(val2, 'sf'),
            expect_equal(as.character(sf::st_geometry_type(val2)), 'POLYGON'),
            expect_identical(val1, val2$geometry),
            expect_equal(names(val2), c('h3_address', 'h3_resolution', 'geometry')),
            expect_equal(sf::st_crs(val1)$epsg, 4326),
            # data frame inputs
            df <- data.frame('h3_resolution_7' = c('8abe8d12acaffff',
                                                   '8abe8d12acaffff',
                                                   '8abe8d12acaffff'),
                             'ID' = seq(3)),
            val3 <- h3_to_polygon(df),
            expect_is(val3, 'sfc_POLYGON'),
            expect_equal(as.character(sf::st_geometry_type(val3[[1]])), 'POLYGON'),
            val4 <- h3_to_polygon(df, simple = FALSE),
            expect_is(val4, 'sf'),
            expect_equal(val3, val4$geometry),
            expect_error(h3_to_polygon(df[ , c(2,1)], simple = FALSE))
            )
)
