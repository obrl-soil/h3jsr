context('address retrieval')

# these functions are all in core.api.R

# geo_to_h3
test_that('geo_to_h3 returns an appropriately structured data frame with single input',
          c(
            brissy <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15),
            expect_is(brissy, 'data.frame'),
            expect_equal(ncol(brissy), 4),
            expect_equal(nrow(brissy), 1),
            expect_equal(names(brissy), c('X', 'Y', 'res', 'h3_address')),
            expect_is(brissy$X, 'numeric'),
            expect_is(brissy$Y, 'numeric'),
            # res can be int or num
            expect_is(brissy$h3_address, 'character'),
            # xy checks
            expect_equal(brissy$h3_address, '8fbe8d12acad2f3')
          ))

test_that('geo_to_h3 returns an appropriately structured data frame with multiple input',
          c(
            brissy <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15)),
            expect_is(brissy, 'data.frame'),
            expect_equal(ncol(brissy), 4),
            expect_equal(nrow(brissy), 15),
            expect_equal(names(brissy), c('X', 'Y', 'res', 'h3_address')),
            expect_is(brissy$X, 'numeric'),
            expect_is(brissy$Y, 'numeric'),
            # res can be int or num
            expect_is(brissy$h3_address, 'character')
          ))

# h3_to_geo
test_that('h3 to geo returns an appropriate dataset',
          c(
            brissy_10 <- h3_to_geo('8abe8d12acaffff'),
            expect_is(brissy_10, 'data.frame'),
            expect_equal(ncol(brissy_10), 3),
            expect_equal(nrow(brissy_10), 1),
            expect_equal(names(brissy_10), c('h3_address', 'h3_x', 'h3_y')),
            expect_is(brissy_10$h3_x, 'numeric'),
            expect_is(brissy_10$h3_y, 'numeric'),
            # xy checks
            expect_equal(brissy_10$h3_x, 153.0239032),
            expect_equal(brissy_10$h3_y, -27.46852938)
          ))
