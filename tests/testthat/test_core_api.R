context('Core H3 API')

# h3_is_valid
test_that(
  'h3_is_valid returns correctly',
  c(
    val <- h3_is_valid(h3_address = '8abe8d12acaffff'),
    val2 <- h3_is_valid(h3_address = 'whereami'),
    expect_is(val, 'data.frame'),
    expect_is(val$h3_address, 'character'),
    expect_is(val$h3_valid, 'logical'),
    expect_equal(val$h3_valid, TRUE),
    expect_equal(val2$h3_valid, FALSE)
  )
)

# h3_is_pentagon
test_that(
  'h3_is_pentagon returns correctly',
  c(
    val <- h3_is_pentagon(h3_address = '8abe8d12acaffff'),
    expect_is(val, 'data.frame'),
    expect_is(val$h3_address, 'character'),
    expect_is(val$h3_pentagon, 'logical'),
    expect_equal(val$h3_pentagon, FALSE)
    # note to self find the addy of a pentagon
  )
)

# h3_is_rc3
test_that(
  'h3_is_rc3 returns correctly',
  c(
    val <- h3_is_rc3(h3_address = '8abe8d12acaffff'),
    expect_is(val, 'data.frame'),
    expect_is(val$h3_address, 'character'),
    expect_is(val$h3_rc3, 'logical'),
    expect_equal(val$h3_rc3, FALSE)
  )
)

# h3_get_base_cell
test_that(
  'h3_get_base_cell returns correctly',
  c(
    val <- h3_get_base_cell(h3_address = '8abe8d12acaffff'),
    expect_is(val, 'data.frame'),
    expect_is(val$h3_address, 'character'),
    expect_is(val$h3_base_cell, 'integer'),
    expect_equal(val$h3_base_cell, 95L)
  )
)

# h3_get_res
test_that(
  'h3_get_res returns correctly',
  c(
    val <- h3_get_res(h3_address = '8abe8d12acaffff'),
    expect_is(val, 'data.frame'),
    expect_is(val$h3_address, 'character'),
    expect_is(val$h3_res, 'integer'),
    expect_equal(val$h3_res, 10L)
  )
)

# geo_to_h3
test_that('geo_to_h3 returns an appropriately structured data frame with single input',
          c(
            val <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15),
            expect_is(val, 'data.frame'),
            expect_equal(ncol(val), 4),
            expect_equal(nrow(val), 1),
            expect_equal(names(val), c('X', 'Y', 'res', 'h3_address')),
            expect_is(val$X, 'numeric'),
            expect_is(val$Y, 'numeric'),
            # res can be int or num
            expect_is(val$h3_address, 'character'),
            # xy checks
            expect_equal(val$h3_address, '8fbe8d12acad2f3')
          ))

test_that('geo_to_h3 returns an appropriately structured data frame with multiple input',
          c(
            val <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15)),
            expect_is(val, 'data.frame'),
            expect_equal(ncol(val), 4),
            expect_equal(nrow(val), 15),
            expect_equal(names(val), c('X', 'Y', 'res', 'h3_address')),
            expect_is(val$X, 'numeric'),
            expect_is(val$Y, 'numeric'),
            # res can be int or num
            expect_is(val$h3_address, 'character')
          ))

# h3_to_geo
test_that('h3 to geo returns an appropriate dataset',
          c(
            val <- h3_to_geo('8abe8d12acaffff'),
            expect_is(val, 'data.frame'),
            expect_equal(ncol(val), 3),
            expect_equal(nrow(val), 1),
            expect_equal(names(val), c('h3_address', 'h3_x', 'h3_y')),
            expect_is(val$h3_x, 'numeric'),
            expect_is(val$h3_y, 'numeric'),
            # xy checks
            expect_equal(val$h3_x, 153.0239032),
            expect_equal(val$h3_y, -27.46852938)
          ))

# h3_to_geo_boundary
test_that('h3 to geo boundary returns an appropriate dataset',
          c(
            val <- h3_to_geo_boundary('8abe8d12acaffff'),
            expect_is(val, 'data.frame'),
            expect_equal(ncol(val), 2),
            expect_equal(nrow(val), 1),
            expect_equal(names(val), c('h3_address', 'h3_hex')),
            expect_is(val$h3_hex, 'list'),
            expect_is(val$h3_hex[[1]], 'matrix'),
            expect_equal(ncol(val$h3_hex[[1]]), 2L),
            expect_is(val$h3_hex[[1]][1], 'numeric'),
            # xy checks
            expect_equal(val$h3_hex[[1]][1,1], 153.0245835),
            expect_equal(val$h3_hex[[1]][1,2], -27.46896347)
          ))
