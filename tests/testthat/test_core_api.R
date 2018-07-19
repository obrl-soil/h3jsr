context('Core H3 API')

# h3_is_valid
test_that(
  'h3_is_valid returns correctly',
  c(
    val1 <- h3_is_valid(h3_address = '8abe8d12acaffff'),
    val2 <- h3_is_valid(h3_address = c('whereami', '8abe8d12acaffff')),
    val3 <- h3_is_valid(h3_address = c('whereami', '8abe8d12acaffff'),
                        simple = FALSE),
    expect_is(val1, 'logical'),
    expect_equal(val1, TRUE),
    expect_is(val2, 'logical'),
    expect_equal(val2, c(FALSE, TRUE)),
    expect_is(val3, 'data.frame'),
    expect_is(val3$h3_address, 'character'),
    expect_is(val3$h3_valid, 'logical'),
    expect_equal(val3$h3_valid, c(FALSE, TRUE))
  )
)

# h3_is_pentagon
test_that(
  'h3_is_pentagon returns correctly',
  c(
    expect_error(h3_is_pentagon(h3_address = 'whereami')),
    val1 <- h3_is_pentagon(h3_address = '8abe8d12acaffff'),
    val2 <- h3_is_pentagon(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_is(val1, 'logical'),
    expect_equal(val1, FALSE),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_pentagon, 'logical'),
    expect_equal(val2$h3_pentagon, FALSE)
    # note to self find the addy of a pentagon
  )
)

# h3_is_rc3
test_that(
  'h3_is_rc3 returns correctly',
  c(
    expect_error(h3_is_rc3(h3_address = 'whereami')),
    val1 <- h3_is_rc3(h3_address = '8abe8d12acaffff'),
    val2 <- h3_is_rc3(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_is(val1, 'logical'),
    expect_equal(val1, FALSE),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_rc3, 'logical'),
    expect_equal(val2$h3_rc3, FALSE)
  )
)

# h3_get_base_cell
test_that(
  'h3_get_base_cell returns correctly',
  c(
    expect_error(h3_get_base_cell(h3_address = 'whereami')),
    val1 <- h3_get_base_cell(h3_address = '8abe8d12acaffff'),
    val2 <- h3_get_base_cell(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_is(val1, 'integer'),
    expect_equal(val1, 95L),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_base_cell, 'integer'),
    expect_equal(val2$h3_base_cell, 95L)
  )
)

# h3_get_res
test_that(
  'h3_get_res returns correctly',
  c(
    expect_error(h3_get_res(h3_address = 'whereami')),
    val1 <- h3_get_res(h3_address = '8abe8d12acaffff'),
    val2 <- h3_get_res(h3_address = '8abe8d12acaffff', simple = FALSE),
    expect_is(val1, 'integer'),
    expect_equal(val1, 10L),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_res, 'integer'),
    expect_equal(val2$h3_res, 10L)
  )
)

# geo_to_h3
test_that('geo_to_h3 returns an appropriately structured data frame with single input',
          c(
            expect_error(geo_to_h3(lon = 153.023503, lat = -27.468920, res = 20)),
            val1 <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15),
            val2 <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15,
                              simple = FALSE),
            expect_is(val1, 'character'),
            expect_equal(val1, '8fbe8d12acad2f3'),
            expect_is(val2, 'data.frame'),
            expect_equal(ncol(val2), 4),
            expect_equal(nrow(val2), 1),
            expect_equal(names(val2), c('X', 'Y', 'h3_res', 'h3_address')),
            expect_is(val2$X, 'numeric'),
            expect_is(val2$Y, 'numeric'),
            expect_is(val2$h3_address, 'character'),
            # xy checks
            expect_equal(val2$h3_address, '8fbe8d12acad2f3')
          ))

test_that('geo_to_h3 returns an appropriately structured data frame with multiple input',
          c(
            val1 <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15)),
            val2 <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15),
                              simple = FALSE),
            expect_is(val1, 'character'),
            expect_equal(length(val1), 15L),
            expect_equal(val1[15], '8fbe8d12acad2f3'),
            expect_is(val2, 'data.frame'),
            expect_equal(ncol(val2), 4),
            expect_equal(nrow(val2), 15),
            expect_equal(names(val2), c('X', 'Y', 'h3_res', 'h3_address')),
            expect_is(val2$X, 'numeric'),
            expect_is(val2$Y, 'numeric'),
            expect_is(val2$h3_address, 'character')
          ))

# h3_to_geo
test_that('h3 to geo returns an appropriate dataset',
          c(
            expect_error(h3_to_geo(h3_address = 'whereami')),
            val1 <- h3_to_geo('8abe8d12acaffff'),
            val2 <- h3_to_geo('8abe8d12acaffff', simple = FALSE),
            expect_is(val1, 'matrix'),
            expect_equal(dim(val1), c(1L,2L)),
            expect_equal(val1[1,1], 153.0239032),
            expect_equal(val1[1,2], -27.46852938),
            expect_is(val2, 'data.frame'),
            expect_equal(ncol(val2), 3),
            expect_equal(nrow(val2), 1),
            expect_equal(names(val2), c('h3_address', 'h3_x', 'h3_y')),
            expect_is(val2$h3_x, 'numeric'),
            expect_is(val2$h3_y, 'numeric'),
            # xy checks
            expect_equal(val2$h3_x, 153.0239032),
            expect_equal(val2$h3_y, -27.46852938)
          ))

# h3_to_geo_boundary
test_that('h3 to geo boundary returns an appropriate dataset',
          c(
            expect_error(h3_to_geo_boundary(h3_address = 'whereami')),
            val1 <- h3_to_geo_boundary('8abe8d12acaffff'),
            val2 <- h3_to_geo_boundary('8abe8d12acaffff', simple = FALSE),
            # xy checks
            expect_equal(val1[[1]][[1]][1,1], 153.0245835),
            expect_equal(val1[[1]][[1]][1,2], -27.46896347),
            expect_equal(length(val1), 1L),
            expect_is(val1, 'sfc_POLYGON'),
            expect_is(val2, 'sf'),
            expect_equal(ncol(val2), 2),
            expect_equal(nrow(val2), 1),
            expect_equal(names(val2), c('h3_address', 'geometry')),
            expect_is(sf::st_geometry(val2), 'sfc_POLYGON'),
            expect_equal(sf::st_crs(val1)$epsg, 4326),
            expect_equal(sf::st_crs(val2)$epsg, 4326),
            # xy checks
            expect_equal(sf::st_geometry(val2)[[1]][[1]][1,1], 153.0245835),
            expect_equal(sf::st_geometry(val2)[[1]][[1]][1,2], -27.46896347)
          ))
