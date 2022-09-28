from process_ui import MainReceiver
from process_ui import AutoOrder


def add_routes_to_resource(_api):
    _api.add_resource(MainReceiver, '/get_request', strict_slashes=False)
    _api.add_resource(AutoOrder, '/auto_order', strict_slashes=False)
