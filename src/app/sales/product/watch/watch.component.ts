import { Component, OnInit, Input } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { StateService } from '../../../services/state.service';
import { WatchModel } from '../../models/watch.model';
import { BaseComponent } from '../../base/base.model';
import { ParamsForQuery } from '../../models/params-to-filter.enum';
import { Filter } from '../../models/filter.model';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss']
})
export class WatchComponent extends BaseComponent implements OnInit {

  products: WatchModel[];
  @Input() paramsToRunQuery: ParamsForQuery;
  @Input() isShowFilterAndSearch = true;
  ParamsForQuery = ParamsForQuery;
  filter = new Filter();
  priceRange = [];
  colourRange = [];
  currentActiveBtn = 0;
  currentActiveShortByOther = 0;
  currentActiveShortByPrice = 0;
  currentActiveColour = [];
  constructor(private productService: ProductService, stateService: StateService, private ngxLoader: NgxUiLoaderService) {
    super(stateService, true);
  }

  ngOnInit() {
    this.runQueryByParam();
  }

  runQueryByParam(paramToFilter?: ParamsForQuery) {
    const param = paramToFilter || this.paramsToRunQuery;
    switch (param) {
      case ParamsForQuery.TopSales:
        this.productService.getTopSales().subscribe((response: WatchModel[]) => {
          this.products = response;
        }, (err) => {
          console.log(err);
        });
        break;
      case ParamsForQuery.ProductsNewest:
        this.productService.getProductsNewest().subscribe((response: WatchModel[]) => {
          this.products = response;
        }, (err) => {
          console.log(err);
        });
        break;
      case ParamsForQuery.ProductAdvance:
        this.productService.getProductAdvance().subscribe((response: WatchModel[]) => {
          this.products = response;
        }, (err) => {
          console.log(err);
        });
        break;
      default:
        this.productService.getProduct().subscribe((response: WatchModel[]) => {
          this.products = response;
        }, (err) => {
          console.log(err);
        });
        break;
    }
  }

  buildParamsForQuery(paramToFilter?: ParamsForQuery): Filter {
    switch (paramToFilter) {
      // ======= Find =======
      // filter.find is a dynamic property which mean you can find any fields in DB ( ex: 'userFor' field )
      case ParamsForQuery.ForMen:
        this.filter.find.useFor = ParamsForQuery.ForMen;
        break;
      case ParamsForQuery.ForWomen:
        this.filter.find.useFor = ParamsForQuery.ForWomen;
        break;
      case ParamsForQuery.ForCouple:
        this.filter.find.useFor = ParamsForQuery.ForCouple;
        break;
      case ParamsForQuery.Price:
        if (this.priceRange[0] !== 0 && this.priceRange[1] === 0) {
          this.priceRange[1] = 500000000;
        }
        if (this.priceRange.length !== 0) {
          this.filter.find.price = { $gte: this.priceRange[0], $lte: this.priceRange[1] };
        } else {
          delete this.filter.find.price;
        }
        break;
      case ParamsForQuery.Colour:
        this.filter.find.colour = { $in: this.colourRange };
        break;
      // ======= Sort =======
      case ParamsForQuery.Descending:
        this.filter.sortByOthers = ParamsForQuery.Descending;
        break;
      case ParamsForQuery.Ascending:
        this.filter.sortByOthers = ParamsForQuery.Ascending;
        break;
      case ParamsForQuery.Newest:
        this.filter.sortByOthers = ParamsForQuery.Newest;
        break;
      case ParamsForQuery.Popular:
        this.filter.sortByOthers = ParamsForQuery.Popular;
        break;

      default:
        this.filter = new Filter();
        break;
    }

    return this.filter;
  }

  excuteFilter(paramForQuery?: ParamsForQuery) {
    this.ngxLoader.startLoader('loader-01');
    const filterObj = this.buildParamsForQuery(paramForQuery);
    this.isEmptyFilterObject(filterObj);
    this.productService.getProductsByFilter(filterObj).subscribe((response: WatchModel[]) => {
      if (response.length === 0) {
        Swal.fire({
          title: 'Thông Báo',
          text: 'Không có sản phẩm trong mục này, xin vui lòng liên hệ với chúng tôi',
          icon: 'info',
          showCancelButton: false,
          confirmButtonText: 'Tắt Thông Báo',
        });
      } else {
        this.products = response;
      }
    }, (err) => {
      Swal.fire({
        title: 'Đã xảy ra lỗi',
        text: 'Xin kiểm tra lại đường truyền hoặc liên hệ với chúng tôi',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Tắt Thông Báo',
      });
    }, () => {
      this.ngxLoader.stopLoader('loader-01');
    });

  }

  setColourRange(colour: string) {
    const checkExistData = this.colourRange.filter((item, index) => this.colourRange.indexOf(item) !== index);
    if (checkExistData.length === 0 && this.colourRange.indexOf(colour) === -1) {
      this.colourRange.push(colour);
    } else {
      const clearDuplicateData = this.colourRange.filter((value, index) => {
        return value !== colour;
      });
      this.colourRange = clearDuplicateData;
    }
  }

  isEmptyFilterObject(obj?: object) {
    return (obj && (Object.keys(obj).length === 0));
  }

}
