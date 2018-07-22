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

test_that('point_to_h3 returns an appropriately structured data frame with single input',
          c(library(sf), # :/
            bth <- sf::st_sfc(sf::st_point(c(153.023503, -27.468920)), crs = 4326),
            bth2 <- sf::st_sfc(sf::st_point(c(153.023503, -27.468920)), crs = 4283),
            expect_error(point_to_h3(bth, res = 20)),
            expect_error(point_to_h3(st_point(c(153.023503, -27.468920)), 15)),
            expect_warning(point_to_h3(bth2, res = 1)),
            val1 <- point_to_h3(bth, res = 15),
            val2 <- point_to_h3(bth, res = 15, simple = FALSE),
            val3 <- point_to_h3(sf::st_sf('geometry' = bth), 15, simple = FALSE),
            expect_identical(val2, val3),
            expect_equal(val1, '8fbe8d12acad2f3'),
            expect_is(val2, 'sf'),
            expect_equal(ncol(val2), 2),
            expect_equal(nrow(val2), 1),
            expect_equal(names(val2), c('h3_resolution_15', 'geometry')),
            expect_equal(val2$h3_resolution_15, '8fbe8d12acad2f3')
          ))

test_that('point_to_h3 returns an appropriately structured data frame with multiple inputs',
          c(library(sf),
            bpts <- list(c(153.02350, -27.46892),
                         c(153.02456, -27.47071),
                         c(153.02245, -27.47078)),
            bpts <- lapply(bpts, sf::st_point),
            bpts <- sf::st_sfc(bpts, crs = 4326),
            bpts_sf <- sf::st_sf('geometry' = bpts),
            # several points 1 res
            val1 <- point_to_h3(bpts, res = 11),
            val2 <- point_to_h3(bpts, res = 11, simple = FALSE),
            # several points several res
            val3 <- point_to_h3(bpts, res = c(11,12)),
            val4 <- point_to_h3(bpts, res = c(11,12), simple = FALSE),
            expect_equal(val1[1], '8bbe8d12acadfff'),
            expect_is(val2, 'sf'),
            expect_is(val3, 'data.frame'),
            expect_is(val4, 'sf'),
            expect_identical(val2$h3_resolution_11, val3$h3_resolution_11,
                             val4$h3_resolution_11),
            expect_identical(val3, sf::st_set_geometry(val4, NULL))
          ))

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
test_that('h3 to geo boundary returns an appropriate dataset',
          c(
            expect_error(h3_to_polygon(h3_address = 'whereami')),
            val1 <- h3_to_polygon('8abe8d12acaffff'),
            val2 <- h3_to_polygon('8abe8d12acaffff', simple = FALSE),
            # xy checks
            expect_equal(val1[[1]][[1]][1,1], 153.0245835),
            expect_equal(val1[[1]][[1]][1,2], -27.46896347),
            expect_is(val1, 'sfc_POLYGON'),
            expect_is(val2, 'sf'),
            expect_identical(val1, val2$geometry),
            expect_equal(names(val2), c('h3_address', 'h3_resolution', 'geometry')),
            expect_equal(sf::st_crs(val1)$epsg, 4326)
          ))
