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
            expect_is(brissy$h3_address, 'character')
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
