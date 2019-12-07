import $ from "jquery";
// import 'datatables.net';
// import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net-bs4/css/dataTables.bootstrap4.css";
import "datatables.net-rowgroup-bs4";

$(document).ready(function () {
  let groupColumn = 0;
  let table = $("#data-table").DataTable({
    columnDefs: [{visible: false, targets: groupColumn}],
    order: [[groupColumn, "asc"]],
    drawCallback: function (settings) {
      let api = this.api();
      let rows = api.rows({page: "current"}).nodes();
      let last = null;

      api
          .column(groupColumn, {page: "current"})
          .data()
          .each(function (group, i) {
            if (last !== group) {
              $(rows)
                  .eq(i)
                  .before(
                      `<tr class="group"><td colspan="7" class="text-center bg-secondary text-light"><b>Group ${group}</b></td></tr>`
                  );

              last = group;
            }
          });
    }
  });

  // Order by the grouping
  $("#data-table tbody").on("click", "tr.group", function () {
    let currentOrder = table.order()[0];
    console.log(currentOrder);
    if (currentOrder[0] === groupColumn && currentOrder[1] === "asc") {
      table.order([groupColumn, "desc"]).draw();
    } else {
      table.order([groupColumn, "asc"]).draw();
    }
  });

  // Select value change
  $("#groupCatalog-select").change(function () {
    let value = $("#groupCatalog-select option:selected").attr("value");
    $("#groupData-tab .tab-pane").removeClass("active show");
    $(value).addClass("active show");
  });
});
